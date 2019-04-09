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
        'volume.set' : (n) => pl.volume = !isNaN(parseFloat(n)) ? parseFloat(n) : pl.volume,
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

            const obj = new SpeechSynthesisUtterance(msg);
            speechSynthesis.speak(obj);
        },

        findAndPlay : query => {

            return fns.findSong(query, 0).then(() => {
                fns.playSong(1);
            });
            
        },

        playFromList : num => {
            const list = mp.list;
            let msg = '';

            if(!list[num-1]) {
                msg = `Could not find song number ${num}`;
            }
            else {
                $(`[data-id="${list[num-1].video_id}"]`).click();
                msg = `Playing ${list[num-1].video_title}`;
            }
            const obj = new SpeechSynthesisUtterance(msg);
            speechSynthesis.speak(obj);
        },
    };
    new SpeechRecog(fns);

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
            download : $("#download"),
        },
        songTitle : $("#songTitle"),
    });

    
});