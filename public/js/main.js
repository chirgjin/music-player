jQuery(document).ready(e => {
    const sp = new SpeechRecog;
    const fns = {
        play : () => pl.play().catch(err => alert("Cant play song :/")),
        stop : () => pl.stop(),
        pause : () => pl.pause(),
        restart : () => pl.restart(),
        toggle : () => pl.toggle(),
        'volume.up' : () => pl.increaseVolume(0.1),
        'volume.down' : () => pl.decreaseVolume(0.1),
        'volume.max' : () => pl.volume=1,
        'volume.mute' : () => pl.muted=true,
        'speed.up' : () => mp.speed(+1),
        'speed.down' : () => mp.speed(-1),
        'speed.normal' : () => pl.speed=1,
        'speed.slowest' : () => mp.speed(-2192),
        'speed.fastest' : () => mp.speed(+232),
        next : () => mp.next(),
        prev : () => mp.prev(),

    };

    const pl = new Plyr('#player', {
        settings : ['loop', 'speed'],
        keyboard : {
            global : true
        }
    });

    const mp = new MusicPlayer(pl, { 
        poster : $("#poster"),
        searchInput : $("#search"),
        searchBtn : $("#searchBtn"),
        searchResults : $("#searchResults"),
        playlist : $("#playlist"),
    });

    sp.addEventListener("result", (e) => {
        console.log(e.command);
        if(e && e.command && fns[e.command.command]) {
            fns[e.command.command]();
        }
    });
    
    sp.start();

    //temp fix when microphone wont start when first calling sp.start :/
    setTimeout(() => {
        sp.start();
    }, 1000);

    /*
    let res;

    mp.search('Dont call me up').then(results => {
        res = results[0];
        return mp.generateUrl(res.video_id);
    }).then(url => {

        res.url = url;

        mp.playSong(res);
    });
    */

    console.log(sp);
    window.sp = sp;
    window.pl =pl;

    
});