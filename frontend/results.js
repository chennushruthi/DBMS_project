// results.js — reads ?mood= and renders sample hotel cards
(function(){
  function qs(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  const mood = qs('mood') || 'all';
  const titleMap = {
    romantic: 'Romantic Getaways',
    work: 'Study & Work Retreats',
    relax: 'Relaxation & Spa',
    family: 'Family-friendly Stays',
    business: 'Business Executive Hotels',
    countryside: 'Countryside & Nature Stays',
    nature: 'Nature Escapes',
    city: 'City View Hotels',
    chill: 'Chill & Poolside',
    luxury: 'Luxury Mood',
    sleep: 'Peaceful Sleep Stays',
    traditional: 'Traditional / Heritage Stays',
    party: 'Party Friendly Hotels',
    all: 'Recommended Stays'
  };

  const sampleData = [
    {id:1,name:'The Serenity Suites',moods:['romantic','luxury'],price:189,img:'assets/rec-romantic.svg',rating:4.8,location:'Lakeview'},
    {id:2,name:"Innovator's Hub",moods:['work','business'],price:120,img:'assets/study-work.svg',rating:4.6,location:'Tech Park'},
    {id:3,name:'Quiet Haven Resorts',moods:['relax','countryside','nature'],price:155,img:'assets/rec-relax.svg',rating:4.5,location:'Hilltop'},
    {id:4,name:'Cozy Family Stay',moods:['family'],price:210,img:'assets/rec-family.svg',rating:4.7,location:'Near Market'},
    {id:5,name:'Downtown Hub',moods:['business','city'],price:140,img:'assets/rec-business.svg',rating:4.3,location:'City Center'},
    {id:6,name:'Nature Rest Bungalows',moods:['countryside','nature'],price:130,img:'assets/rec-countryside.svg',rating:4.4,location:'Countryside'},
    {id:7,name:'Pocket Stay — Budget',moods:['work','sleep'],price:59,img:'assets/mood-sleep.svg',rating:4.0,location:'Suburb'},
  ];

  document.getElementById('resultsTitle').textContent = titleMap[mood] || titleMap.all;
  document.getElementById('resultsSub').textContent = mood === 'all' ? 'Showing top picks' : `Showing stays for “${titleMap[mood] || mood}”`;

  const grid = document.getElementById('resultsGrid');
  const filterInput = document.getElementById('searchFilter');

  function render(list){
    grid.innerHTML = '';
    if(!list.length){
      grid.innerHTML = '<div style="grid-column:1/-1;padding:18px;color:#475569">No results found for this mood.</div>';
      return;
    }
    list.forEach(h => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'hotel-card';
      a.style.textDecoration='none';
      a.style.color='inherit';

      a.innerHTML = `
        <img class=\"hotel-thumb\" src=\"${h.img}\" alt=\"${h.name}\" />
        <div class=\"hotel-body\">
          <div class=\"hotel-title\">${h.name}</div>
          <div class=\"hotel-meta\">${h.location} • from ₹${h.price}/night</div>
          <div style=\"flex:1\"></div>
        </div>
        <div class=\"hotel-footer\">
          <div class=\"rating\">⭐ ${h.rating.toFixed(1)}</div>
          <div style=\"font-weight:700;color:#0f172a\">₹${h.price}</div>
        </div>
      `;

      // clicking a hotel could open a detail page. For now, show placeholder behavior
      a.addEventListener('click', function(e){
        e.preventDefault();
        alert(h.name + '\nRating: ' + h.rating + '\nPrice: ₹' + h.price + '\n\n(Implement hotel detail page or booking flow)');
      });

      grid.appendChild(a);
    });
  }

  function getFiltered(){
    const q = filterInput.value.trim().toLowerCase();
    let result;
    if(mood === 'all') result = sampleData.slice();
    else result = sampleData.filter(h => h.moods.includes(mood));
    if(q) result = result.filter(h => h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q));
    return result;
  }

  filterInput.addEventListener('input', function(){ render(getFiltered()); });

  // initial render
  render(getFiltered());
})();