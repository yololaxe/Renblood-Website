import {auth} from '../data/firebaseConfig';

export async function economyRequest(path,{signal,body,key}={}){
  const user=auth.currentUser;
  if(!user)throw Object.assign(new Error('Connectez-vous pour ouvrir le registre.'),{code:'AUTH_REQUIRED'});
  const token=await user.getIdToken();
  const headers={Authorization:`Bearer ${token}`};
  if(body)headers['Content-Type']='application/json';
  if(key)headers['Idempotency-Key']=key;
  const controller=new AbortController(),abort=()=>controller.abort();
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
  let timedOut=false;const timeout=setTimeout(()=>{timedOut=true;controller.abort();},15000);
  try{
    const response=await fetch(`${(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')}/api/economy/v1/${path}`,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,signal:controller.signal});
    const data=await response.json().catch(()=>({message:'Le registre est momentanément indisponible.'}));
    if(!response.ok)throw Object.assign(new Error(data.message||'Le registre est indisponible.'),{code:data.code,status:response.status,retryable:data.retryable??response.status>=500});
    return data;
  }catch(error){if(timedOut)throw Object.assign(new Error('Le registre n’a pas répondu à temps. Vérifiez le reçu ou reprenez la même demande.'),{retryable:true,code:'REQUEST_TIMEOUT'});if(error.name==='TypeError')error.retryable=true;throw error;}
  finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
}
export const economyApi={get:(path,signal)=>economyRequest(path,{signal}),post:(path,body,key)=>economyRequest(path,{body,key})};
export const queryString=values=>new URLSearchParams(Object.entries(values).filter(([,value])=>value!==''&&value!==undefined&&value!==null)).toString();
