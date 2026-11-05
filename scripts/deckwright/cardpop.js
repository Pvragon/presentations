(function(){
const MAP=__MAP__;
if(!Object.keys(MAP).length)return;
const re=new RegExp(__RE__,'g');
const root=document.querySelector('.wrap')||document.body;
const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||p.closest('script,style,svg,title,.cardref,#cardpop'))return NodeFilter.FILTER_REJECT;re.lastIndex=0;return re.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
for(const n of nodes){const f=document.createDocumentFragment();let last=0;const s=n.nodeValue;re.lastIndex=0;let m;
 while((m=re.exec(s))){f.appendChild(document.createTextNode(s.slice(last,m.index)));const sp=document.createElement('span');sp.className='cardref';sp.tabIndex=0;sp.dataset.card=MAP[m[1]];sp.textContent=m[1];f.appendChild(sp);last=m.index+m[1].length;}
 f.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(f,n);}
const pop=document.getElementById('cardpop'),img=document.getElementById('cardimg');
function place(x,y){const w=pop.offsetWidth||300,h=pop.offsetHeight||420,vw=innerWidth,vh=innerHeight;let l=x+18,t=y-h/2;if(l+w>vw-8)l=x-w-18;if(l<8)l=8;if(t<8)t=8;if(t+h>vh-8)t=vh-h-8;pop.style.left=l+'px';pop.style.top=t+'px';}
function show(el,x,y){img.src=el.dataset.card;img.alt=el.textContent;pop.hidden=false;place(x,y);}
function hide(){pop.hidden=true;}
document.addEventListener('mouseover',ev=>{const el=ev.target.closest&&ev.target.closest('.cardref');if(el)show(el,ev.clientX,ev.clientY);});
document.addEventListener('mousemove',ev=>{if(!pop.hidden)place(ev.clientX,ev.clientY);});
document.addEventListener('mouseout',ev=>{const el=ev.target.closest&&ev.target.closest('.cardref');if(el&&!el.contains(ev.relatedTarget))hide();});
document.addEventListener('focusin',ev=>{const el=ev.target.closest&&ev.target.closest('.cardref');if(el){const r=el.getBoundingClientRect();show(el,r.right,r.top+r.height/2);}});
document.addEventListener('focusout',hide);
document.addEventListener('click',ev=>{const el=ev.target.closest&&ev.target.closest('.cardref');if(el&&matchMedia('(hover: none)').matches){ev.preventDefault();if(pop.hidden||img.alt!==el.textContent){const r=el.getBoundingClientRect();show(el,r.left,r.bottom+200);}else hide();}else if(!el)hide();});
})();
