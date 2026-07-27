window.SKBS_PHOTOS=window.SKBS_PHOTOS||{};
window.SKBS_PHOTO_CHUNKS=window.SKBS_PHOTO_CHUNKS||{};
if(window.SKBS_PHOTO_CHUNKS.fridges){
  window.SKBS_PHOTOS['hotel-fridges']='data:image/webp;base64,'+window.SKBS_PHOTO_CHUNKS.fridges;
}

(function(){
  var pageBackdrop=document.querySelector('.page-photo-bg');
  if(pageBackdrop) pageBackdrop.style.display='none';

  var hero=document.querySelector('.hero-bg');
  if(!hero) return;

  hero.style.display='block';
  hero.style.opacity='1';
  hero.style.backgroundColor='#161616';
  hero.style.backgroundPosition='center';
  hero.style.backgroundSize='cover';
  hero.style.backgroundRepeat='no-repeat';
  hero.style.backgroundImage="url('assets/hero-dc24977.webp')";

  window.SKBS_BG_CHUNKS=[];
  var paths=[];
  for(var i=0;i<7;i++) paths.push('background-chunks/hero-'+i+'.js?v=hero-bg-2');

  function load(index){
    if(index>=paths.length){
      if(window.SKBS_BG_CHUNKS.length!==7||window.SKBS_BG_CHUNKS.some(function(part){return typeof part!=='string'||!part.length;})) return;
      var source='data:image/webp;base64,'+window.SKBS_BG_CHUNKS.join('');
      var probe=new Image();
      probe.onload=function(){
        hero.style.backgroundImage='url("'+source+'")';
        document.body.classList.add('hero-photo-ready');
      };
      probe.onerror=function(){ console.error('Главная панорама не загрузилась'); };
      probe.src=source;
      return;
    }
    var script=document.createElement('script');
    script.src=paths[index];
    script.async=false;
    script.onload=function(){load(index+1);};
    script.onerror=function(){console.error('Не загрузилась часть панорамы',paths[index]);};
    document.head.appendChild(script);
  }
  load(0);
})();