class SpeechRecog {
    get commands() {
        return {
            'start( playing)' : this._exec('play'),
            'play( songs)' :  this._exec('play'),
            // 'play *song' :  this._exec('play'),
            'play my song(s)' : this._exec('play'),
            'resume( song(s))' : this._exec('play'),

            'stop( playing)' : this._exec('stop'),
            'close' : this._exec('stop'),
            'shut( )up' : this._exec('stop'),

            'pause( song)' : this._exec('pause'),
            'wait' : this._exec('pause'),

            'restart' : this._exec('restart'),
            'start again' : this._exec('restart'),
            'play from( the) beginning' : this._exec('restart'),
            'play again' : this._exec('restart'),

            'toggle( playback)' : this._exec('toggle'),

            'volume up' : this._exec('volume.up'),
            'increase volume' : this._exec('volume.up'),
            'turn( the) volume up' : this._exec('volume.up'),
            'louder' : this._exec('volume.up'),

            'volume down' : this._exec('volume.down'),
            'too loud' : this._exec('volume.down'),
            'turn( the) volume down' : this._exec('volume.down'),
            'decrease volume' : this._exec('volume.down'),

            'max(imum) volume' : this._exec('volume.max'),
            'increase volume to max(imum)' : this._exec('volume.max'),
            'full volume' : this._exec('volume.max'),

            'mute' : this._exec('volume.mute'),
            'min(imum) volume' : this._exec('volume.mute'),

            'unmute' : this._exec('volume.unmute'),

            'fast(er)' : this._exec('speed.up'),
            'increase speed' : this._exec('speed.up'),
            
            'slow(er)' : this._exec('speed.down'),
            'decrease speed': this._exec('speed.down'),

            'normal speed' : this._exec('speed.normal'),
            'back to normal( speed)' : this._exec('speed.normal'),

            'slowest speed' : this._exec('speed.slowest'),
            'min(imum) speed' : this._exec('speed.slowest'),

            'fastest speed' : this._exec('speed.fastest'),
            'max(imum) speed' : this._exec('speed.fastest'),

            'shuffle( *songs)' : this._exec('shuffle'),
            '(play )next( song)' : this._exec('next'),
            '(play )prev(ious)( song)' : this._exec('prev'),


            'find and play *song' : song => {
                this.functions.findAndPlay(song);
            },

            'find and play' : () => {
                //do nothing
            },

            'find *song' : (song) => {
                this.functions.findSong(song);
            },

            'play song( number) :num' : (num) => {
                const digits = ['zero', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];

                if( digits.indexOf(num) > -1 ) {
                    num = digits.indexOf(num);
                }
                
                console.log(num);
                if( parseInt(num) == num ) {
                    this.functions.playSong(parseInt(num));
                }
            },

            'play song number :num from( my) playlist' : num => {
                const digits = ['zero', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];

                if( digits.indexOf(num) > -1 ) {
                    num = digits.indexOf(num);
                }
                
                console.log(num);
                if( parseInt(num) == num ) {
                    this.functions.playFromList(parseInt(num));
                }
            },

            'set volume to :vol' : vol => {

                let n = parseFloat(vol);

                if(vol && vol.toString().match(/%|percent/)) {
                    n = n / 100;
                }

                if( !isNaN(n)) {
                    this.functions['volume.set'](n);
                }
            }

        }
    }

    constructor(fns) {
        
        if(!annyang) {
            return alert("Speech Recognition could not be loaded");
        }

        this.functions = fns;
        annyang.addCommands( this.commands );
        annyang.debug(true);

        this.start();
    }

    _exec(name) {
        
        return () => {
            console.log(`called ${name}`, this.functions[name]);
            this.functions[name] ? this.functions[name]() : null;
        }
    }

    start() {
        annyang.start();
    }
}