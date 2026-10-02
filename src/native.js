import {Capacitor} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {Haptics,NotificationType} from '@capacitor/haptics';
import {Share} from '@capacitor/share';
window.RANGER_CONFIG=RANGER_CONFIG;
let saveQueue=Promise.resolve();
window.RangerNative={
 isNative:Capacitor.isNativePlatform(),
 save(key,value){ saveQueue=saveQueue.then(()=>Preferences.set({key,value})).catch(()=>window.dispatchEvent(new Event('ranger-save-error'))); return saveQueue; },
 remove(key){saveQueue=saveQueue.then(()=>Preferences.remove({key})).catch(()=>{});return saveQueue;},
 async hydrate(){if(!Capacitor.isNativePlatform())return;for(const key of ['celestialRangerSave','rangerNotes']){const {value}=await Preferences.get({key});if(value)localStorage.setItem(key,value);}},
 celebrate(){Haptics.notification({type:NotificationType.Success}).catch(()=>{});},
 async share(data){ if(Capacitor.isNativePlatform())return Share.share(data);if(navigator.share)return navigator.share(data);const blob=new Blob([data.title+'\n\n'+data.text],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Celestial-Ranger-Certificate.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000); },
 speak(text,who){if(!('speechSynthesis' in window))return;this.stopSpeaking();const u=new SpeechSynthesisUtterance(text);u.rate=who==='fernan'?1.04:.90;u.pitch=who==='fernan'?1.15:.92;speechSynthesis.speak(u);},
 stopSpeaking(){window.speechSynthesis?.cancel();}
};
window.rangerReady=window.RangerNative.hydrate().catch(()=>{});
// Native speech is only activated by an explicit tap on Speak.
import {SpeechRecognition} from '@capacitor-community/speech-recognition';
import {TextToSpeech} from '@capacitor-community/text-to-speech';
let speechListeners=[],speechTimeout,browserRecognition,stopping=false;
const webSpeak=window.RangerNative.speak.bind(window.RangerNative);
window.RangerNative.speak=async(text,who)=>{if(!Capacitor.isNativePlatform())return webSpeak(text,who);try{await TextToSpeech.stop();await TextToSpeech.speak({text,lang:'en-US',rate:who==='fernan'?1.04:.9,pitch:who==='fernan'?1.15:.92,volume:1,category:'playback'});}catch{window.dispatchEvent(new CustomEvent('ranger-voice-error'));}};
window.RangerNative.stopSpeaking=()=>{window.speechSynthesis?.cancel();if(Capacitor.isNativePlatform())TextToSpeech.stop().catch(()=>{});};
window.RangerNative.stopListening=async()=>{if(stopping)return;stopping=true;try{clearTimeout(speechTimeout);const old=speechListeners;speechListeners=[];for(const listener of old)await listener.remove();browserRecognition?.abort();browserRecognition=null;if(Capacitor.isNativePlatform())await SpeechRecognition.stop().catch(()=>{});}finally{stopping=false;}};
window.RangerNative.listen=async(onText,onStop)=>{
 window.RangerNative.stopSpeaking();
 if(Capacitor.isNativePlatform()){
  if(!(await SpeechRecognition.available()).available)throw Error('Speech unavailable');
  const permission=await SpeechRecognition.requestPermissions();if(permission.speechRecognition!=='granted')throw Error('Speech permission denied');
  speechListeners.push(await SpeechRecognition.addListener('partialResults',r=>{if(r.matches?.[0])onText(r.matches[0]);}));
  speechListeners.push(await SpeechRecognition.addListener('listeningState',r=>{if(r.status==='stopped'){window.RangerNative.stopListening().then(onStop);}}));
  await SpeechRecognition.start({language:'en-US',partialResults:true,popup:false,maxResults:1});
 }else{
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)throw Error('Unsupported');
  browserRecognition=new Recognition();browserRecognition.lang='en-US';browserRecognition.interimResults=true;
  browserRecognition.onresult=e=>onText(Array.from(e.results).map(r=>r[0].transcript).join(' '));browserRecognition.onend=onStop;browserRecognition.onerror=onStop;browserRecognition.start();
 }
 speechTimeout=setTimeout(()=>window.RangerNative.stopListening().then(onStop),20000);
};
