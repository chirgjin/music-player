jQuery(document).ready(e => {
    const speak = (msg) => {
        const obj = new SpeechSynthesisUtterance(msg);
        speechSynthesis.speak(obj);
    };

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


        findSong : (query,spk=1) => {
            
            const obj = new SpeechSynthesisUtterance(`Looking for ${query}`);
            speechSynthesis.speak(obj);

            mp.dom.searchInput.val(query);
            return mp.searchSongs().then(() => {
                if(spk) {
                    const msg = new SpeechSynthesisUtterance(`Found ${mp.dom.searchResults.find('.result').length} Results for ${query}`);
                    speechSynthesis.speak(msg);
                }
            });
        },

        playSong : pos => {
            const el = $( mp.dom.searchResults.find('.result').get( parseInt(pos) - 1 || 0 ) );
            let msg = '';
            if(el.length < 1) {
                msg = `Could not find song number ${pos}`;
            }
            else {
                el.find('.play').click();
                msg = `Playing ${el.find('.title').text()}`;
            }
            console.log(msg);

            const obj = new SpeechSynthesisUtterance(msg);
            speechSynthesis.speak(obj);
        },

        findAndPlay : query => {

            return fns.findSong(query, 0).then(() => {
                fns.playSong(1);
            });
            
        }
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