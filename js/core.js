var LocalLang=new Object();
LocalLang.NeedNum="请输入正确的数字。";
LocalLang.TimeRangeErr="设定的时间有误! 总定时时间应大于0且在10000分钟内。";
LocalLang.Need24h="设定的时间有误，请输入24小时制时间。";
LocalLang.CannotSetTime2Now="不能将时间设定为现在。";
LocalLang.TimeUp="时间到！";
LocalLang.WarnText="你有正在进行的定时，离开本页将撤销此定时。";

jQuery(document).ready(function(){
  var lang = jQuery.cookies.get("lang");
  if(lang){
    selectLang(lang);
  }else{
    var d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    jQuery.cookies.set("lang",window.navigator.userLanguage||window.navigator.language,{expiresAt:d});
  }
});

var totalSec;
var timer;
var siteTitle=document.title;
var progressWidth=601;
var isAfter=true;
var isLoop=false;
var endTime;
var isTiming=false;
var promptText="";

jQuery(document).ready(function(){
  var url=document.location.href;
  var m=url.match(/\?[0-9]{1,}$/);
  if(m!=null){
    jQuery("#min").val(String(m).replace("?",""));
    isAfter=false;
    toggleSwitchUntil();
    startTiming();
  }else{
    m=url.match(/\?([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/);
    if(m!=null){
      m=m[0];
      jQuery("#hour").val(String(m).match(/([0-1]?[0-9]|2[0-3]):/)[0].replace(":",""));
      jQuery("#min").val(String(m).match(/([0-5]?[0-9])$/)[0]);
      isAfter=true;
      toggleSwitchUntil();
      startTiming();
    }
  }
});
window.onbeforeunload = function(e){
  if(isTiming){
      var warnText=LocalLang.WarnText;
      var e = e || window.event;
      if (e) {
        e.returnValue = warnText ;
      }
      return  warnText;
  }
}

var canPlaySound=false;
var TimeUpSound;
soundManager.url="/assets/ring/soundmanager2.swf";
soundManager.useFlashBlock = false;
soundManager.onready(function() {
  if (soundManager.supported()) {
  canPlaySound=true;
  TimeUpSound = soundManager.createSound({
    id: 'aSound',
    url: '/assets/ring/ring.mp3',
    autoLoad:true,
    loops:3
  });
  } else {
  canPlaySound=false;
  }
});
function playSound(){
  if(canPlaySound){
  TimeUpSound.play();
  }
}
function stopSound(){
  if(canPlaySound){
  TimeUpSound.stop();
  }
}
function timecount(hour,min,sec){

    var hh=hour;
    var mm=min;
    var ss=sec;
    //var mm=jQuery("#min").val()*1;
    //var ss=jQuery("#sec").val()*1;

    if(isNaN(hh)||isNaN(mm)||isNaN(ss)){
      alert(LocalLang.NeedNum);
      return;
    }
    var now=new Date();
    endTime = new Date();
    if(isAfter){
      totalSec=hh*3600+mm*60+ss;
      if(totalSec<=0||totalSec>600000){
        alert(LocalLang.TimeRangeErr);
        return;
      }
    endTime.setHours(now.getHours()+hh);
    endTime.setMinutes(now.getMinutes()+mm);
    endTime.setSeconds(now.getSeconds()+ss);
    }else{
      if(!(hh<24&&hh>=0&&mm<60&&mm>=0&&ss<60&&ss>=0)){
        alert(LocalLang.Need24h);
        return;
      }
      endTime.setHours(hh);
      endTime.setMinutes(mm);
      endTime.setSeconds(ss);
      totalSec=Math.round((endTime-now)/1000);
      if(totalSec<0){
      endTime.setTime(endTime.getTime()+60*60*24*1000);
        totalSec=60*60*24+totalSec;
      }else if(totalSec==0){
        alert(LocalLang.CannotSetTime2Now);
        return;
      }
    }
    isTiming=true;
    timer=window.setInterval("refreshProgress();",200);
    jQuery("#progressBar").css('width',0);
    refreshProgress();
    toggleProgressSection();
}

function startTiming(){
  if(isTiming){return;}
  var hh=jQuery("#hour").val()*1;
  var mm=jQuery("#min").val()*1;
  var ss=jQuery("#sec").val()*1;

  if(isNaN(hh)||isNaN(mm)||isNaN(ss)){
    alert(LocalLang.NeedNum);
    return;
  }
  var now=new Date();
  endTime = new Date();
  if(isAfter){
    totalSec=hh*3600+mm*60+ss;
    if(totalSec<=0||totalSec>600000){
      alert(LocalLang.TimeRangeErr);
      return;
    }
  endTime.setHours(now.getHours()+hh);
  endTime.setMinutes(now.getMinutes()+mm);
  endTime.setSeconds(now.getSeconds()+ss);
  }else{
    if(!(hh<24&&hh>=0&&mm<60&&mm>=0&&ss<60&&ss>=0)){
      alert(LocalLang.Need24h);
      return;
    }
    endTime.setHours(hh);
    endTime.setMinutes(mm);
    endTime.setSeconds(ss);
    totalSec=Math.round((endTime-now)/1000);
    if(totalSec<0){
    endTime.setTime(endTime.getTime()+60*60*24*1000);
      totalSec=60*60*24+totalSec;
    }else if(totalSec==0){
      alert(LocalLang.CannotSetTime2Now);
      return;
    }
  }
  isTiming=true;
  timer=window.setInterval("refreshProgress();",200);
  jQuery("#progressBar").css('width',0);
  refreshProgress();
  toggleProgressSection();
}


function timeout(){
  window.clearTimeout(timer);
  isTiming=false;
  playSound();
  jQuery("#progressBar").animate({width:progressWidth},200,function(){
  if(promptText!=""){
    if(promptText.match(/^http/)){
      window.open(promptText);
    }
    alert(LocalLang.TimeUp+"\n"+promptText);
  }else{
    alert(LocalLang.TimeUp);
  }
    document.title=siteTitle;
    stopSound();
    toggleProgressSection();
  if(isLoop){
    startTiming();
  }
  });
}
function cancelTiming(){
  window.clearTimeout(timer);
  isTiming=false;
  document.title=siteTitle;
  toggleProgressSection();
}
function toggleProgressSection(){
  jQuery("#progressSection").toggle("slow");
  jQuery("#inputSection").toggle("slow");
}
function toggleSwitchUntil(){
  if(isAfter){
    isAfter=false;
    jQuery("#switchUntil").stop(true,true).animate({width:94},300);
  }else{
    isAfter=true;
    jQuery("#switchUntil").stop(true,true).animate({width:39},300);
  }
}
function toggleSwitchNoLoop(){
  if(isLoop){
    isLoop=false;
    jQuery("#switchNoLoop").stop(true,true).animate({width:94},300);
  }else{
    isLoop=true;
    jQuery("#switchNoLoop").stop(true,true).animate({width:39},300);
  }
}
function popPromptTextSetter(){
  jQuery("#mask").fadeTo("normal","0.8");
  jQuery("#promptTextSetter").show("fast");
}
function hidePromptTextSetter(){
  jQuery(".popupContent").hide();
  jQuery("#mask").fadeTo("normal","0",function(){jQuery("#mask").hide();});
}
function setPrompt(){
  promptText=jQuery("#promptText").val()+"";
  hidePromptTextSetter();
}
function refreshProgress(){
  var now=new Date();
  var sec=Math.round((endTime-now)/1000);
  var progressText=Math.floor(sec/3600)+":"+Math.floor((sec%3600)/60)+":"+Math.floor(sec%60);
  document.title=progressText+" - "+siteTitle;
  jQuery("#progressText").text(progressText);
  jQuery("#progressBar").animate({width:(1-(sec/totalSec))*progressWidth},{queue:false,duration:200});
  if(sec<=0){
    timeout();
  }
}

var focusedInput;
var scrollTime=0;
var scrollFunc=function(e){
  if(focusedInput==null){return;}
  if(++scrollTime!=2){
    return;
  }
  scrollTime=0;
  var direct=0;
  e=e || window.event;
  if(e.wheelDelta){
    direct=e.wheelDelta>0?1:-1;
  }else if(e.detail){
    direct=e.detail<0?1:-1;
  }
  ScrollText(direct);
  return false;
}
function ScrollText(arg){
  var _value=focusedInput.value*1;
  if(isNaN(_value)){
    focusedInput.value=0;
    _value=0;
  }
  if(arg>0){
    _value++;
  }else{
    _value--;
  }
  if(_value<0){_value=59;}
  if(_value>59){_value=0;}
  focusedInput.value=_value;
  focusedInput.select();
}
(function($) {
  $.fn.defaultvalue = function() {
  var elements = this;
  var args = arguments;
  var c = 0;
  return(
    elements.each(function() {
    var el = $(this);
    var def = args[c++];
    el.val(def).focus(function() {
      if(el.val() == def) { el.val(''); }
      el.blur(function() {
      if(el.val() == '') { el.val(def); }
      focusedInput=null;
     });
     focusedInput=el[0];
    });
    })
  );
  }
})(jQuery);
jQuery(document).ready(function(){
  jQuery('#hour,#min,#sec').defaultvalue('0','0','0');
  if(document.addEventListener){  document.addEventListener('DOMMouseScroll',scrollFunc,false); }
  window.onmousewheel=document.onmousewheel=scrollFunc;
});
