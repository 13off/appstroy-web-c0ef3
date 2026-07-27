(function(){
  var hero=document.querySelector('.hero');
  if(!hero) return;

  var image=hero.querySelector('.hero-cover-photo');
  if(!image){
    image=document.createElement('img');
    image.className='hero-cover-photo';
    image.alt='';
    image.setAttribute('aria-hidden','true');
    image.src='assets/hero-dc24977.webp';
    hero.insertBefore(image,hero.firstChild);
  }

  image.addEventListener('load',function(){hero.classList.add('hero-photo-loaded');},{once:true});
  image.addEventListener('error',function(){
    image.src='assets/hero-dc24977.webp';
  },{once:true});

  window.SKBS_BG_CHUNKS=[];
  var paths=[];
  for(var i=0;i<7;i++) paths.push('background-chunks/hero-'+i+'.js?v=hero-direct-1');

  function loadPart(index){
    if(index>=paths.length){
      if(window.SKBS_BG_CHUNKS.length!==7) return;
      if(window.SKBS_BG_CHUNKS.some(function(part){return typeof part!=='string'||part.length===0;})) return;
      var source='data:image/webp;base64,'+window.SKBS_BG_CHUNKS.join('');
      var probe=new Image();
      probe.onload=function(){
        image.src=source;
        hero.classList.add('hero-photo-loaded');
      };
      probe.onerror=function(){
        image.src='assets/hero-dc24977.webp';
      };
      probe.src=source;
      return;
    }
    var script=document.createElement('script');
    script.src=paths[index];
    script.async=false;
    script.onload=function(){loadPart(index+1);};
    script.onerror=function(){image.src='assets/hero-dc24977.webp';};
    document.head.appendChild(script);
  }

  loadPart(0);
})();