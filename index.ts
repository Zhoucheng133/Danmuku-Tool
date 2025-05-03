import axios from 'axios';
import readline from 'readline';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: any) => {
      rl.close();
      resolve(answer);
    });
  });
}

enum VideoType{
  bv, ep
}

async function getCid(type: VideoType, id: string): Promise<number>{
  if(type==VideoType.bv){
    let {data: response}=await axios.get(`https://api.bilibili.com/x/web-interface/wbi/view?bvid=${id}`);
    if(response.code==0){
      return response.data.cid
    }
  }else{
    let {data: response}=await axios.get(`https://api.bilibili.com/pgc/view/web/season?ep_id=${id}`);
    if(response.code==0){
      let epLength: number=response.result.episodes.length;
      try {
        let selectEp=parseInt(await ask(`总集数为${epLength}, 输入集数: `));
        return response.result.episodes[selectEp-1].cid;
      } catch (_) {
        console.log("输入的集数不合法");
      }
    }
  }
  return 0;
}

function getDanmuku(cid: number){
  return `https://comment.bilibili.com/${cid}.xml`;
}

const main = async () => {
  const vid = await ask("输入bv号或ep号: ");
  let cid=0;
  if(vid.startsWith("bv") || vid.startsWith("BV")){
    cid=await getCid(VideoType.bv, vid);
  }else if(vid.startsWith("ep") || vid.startsWith("EP")){
    cid=await getCid(VideoType.ep, vid.substring(2))
  }

  if(cid==0){
    console.log("请求cid错误");
    return;
  }else{
    console.log(getDanmuku(cid));
    
    // console.log(`cid: ${cid}`);
  }
  
};

main();
