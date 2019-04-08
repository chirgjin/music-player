jQuery(document).ready(e => {
    const fns = {
        play : () => pl.play().catch(err => {}),
        stop : () => pl.stop(),
        pause : () => pl.pause(),
        restart : () => pl.play(pl.restart()),
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
        shuffle : () => $("#shuffle").click(),

    };
    const sp = new SpeechRecog(fns);

    const pl = new Plyr('#player', {
        settings : ['loop', 'speed'],
        keyboard : {
            global : true
        },
        blankVideo : 'sound/blank.mp3',
    });

    pl.autoplay = true;

    pl.on("ended", fns.next);

    const mp = new MusicPlayer(pl, { 
        poster : $("#poster"),
        searchInput : $("#search"),
        searchBtn : $("#searchBtn"),
        searchResults : $("#searchResults"),
        playlist : $("#playlist").find("ul"),
        toastHolder : $("#toastHolder"),
        buttons : {
            next : $("#next"),
            prev : $("#prev"),
            backward : $("#backward"),
            forward : $("#forward"),
            shuffle : $("#shuffle"),
        },
        songTitle : $("#songTitle"),
    });

    /*sp.addEventListener("result", (e) => {
        console.log(e.command);
        if(e && e.command && fns[e.command.command]) {
            fns[e.command.command]();
        }
    });*/
    
    sp.start();

    //temp fix when microphone wont start when first calling sp.start :/
    // setTimeout(() => {
    //     sp.start();
    // }, 1000);

    console.log(sp);
    window.sp = sp;
    window.pl =pl;
    window.mp = mp;

    
});