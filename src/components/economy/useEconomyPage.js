import {useEffect,useRef,useState} from 'react';
export function useEconomyPage(api,path,key='operations'){
  const [data,setData]=useState([]),[loadedPath,setLoadedPath]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[more,setMore]=useState(false),[refresh,setRefresh]=useState(0);
  const controller=useRef(null),generation=useRef(0),cursor=useRef(null),busy=useRef(false);
  useEffect(()=>{
    const current=++generation.current;controller.current?.abort();const request=new AbortController();controller.current=request;busy.current=true;
    setLoading(true);setError('');setData([]);setMore(false);cursor.current=null;
    api.get(path,request.signal).then(result=>{if(current!==generation.current||request.signal.aborted)return;setData(result[key]);setLoadedPath(path);setMore(result.has_more);cursor.current=result.next_cursor;})
      .catch(failure=>{if(failure.name!=='AbortError'&&current===generation.current)setError(failure.message);})
      .finally(()=>{if(current===generation.current){setLoading(false);busy.current=false;}});
    return ()=>request.abort();
  },[api,path,key,refresh]);
  const next=async()=>{
    if(busy.current||!cursor.current)return;busy.current=true;setLoading(true);setError('');const current=generation.current;
    try{const result=await api.get(`${path}${path.includes('?')?'&':'?'}before=${encodeURIComponent(cursor.current)}`,controller.current.signal);
      if(current!==generation.current)return;setData(old=>[...old,...result[key].filter(row=>!old.some(existing=>(existing.operation_id||existing.business_id)===(row.operation_id||row.business_id)))]);setMore(result.has_more);cursor.current=result.next_cursor;
    }catch(failure){if(failure.name!=='AbortError'&&current===generation.current)setError(failure.message);}
    finally{if(current===generation.current){setLoading(false);busy.current=false;}}
  };
  return {data:loadedPath===path?data:[],loading,error,more:loadedPath===path&&more,next,reload:()=>setRefresh(value=>value+1)};
}
