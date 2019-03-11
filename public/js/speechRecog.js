if(!window.hasOwnProperty('webkitSpeechRecognition')) {
    (() => {

        window.webkitSpeechRecognition = class {};

        alert("Your browser is not supported");
    })();
}

class SpeechRecog extends webkitSpeechRecognition {
    get onresult() {
        return () => {};
    }

    set onresult(f) {
        this.addEventListener('result', f);
    }

    get commands() {
        return [
            // this.regex(/^(start|start playing)$/i, 'start'),
            this.regex(/^(stop|stop playing|close|shutup|shut up)$/i, 'stop'),
            this.regex(/^(start|start playing|play|resume|play songs?|play my song)$/i, 'play'),
            this.regex(/^(pause|wait)$/i, 'pause'),
            this.regex(/^(volume up|louder|turn( the)? volume up|increase volume)$/i, 'volume.up'),
            this.regex(/^(volume down|too loud|turn( the)? volume down|decrease volume)$/i, 'volume.down'),
        ]
    }

    /**
     * 
     * @param {RegExp} r Regular Expression to match
     * @param {String} name Command to execute
     */
    regex(r, name) {
        return { regex : r, command : name };
    }

    constructor() {
        super();
        this.continuous = true;

        window.addEventListener('beforeunload', (e) => {
            this.stop();
        });

        this.addEventListener('result', (e) => {
            e.result = this.parseResults(e);
            e.command = this.matchCommands(e.result);
        });
    }

    /**
     * 
     * @param {SpeechRecognitionEvent} evt Result Event
     * 
     * @returns {String} result text
     */
    parseResults(evt) {

        /*const res = Array.prototype.slice.call(evt.results).sort(
            (a,b) => {
                const x = a && a[0] && a[0].confidence || 0;
                const y = b && b[0] && b[0].confidence || 0;

                return y-x;
            }
        );*/
        const res = evt.results;
        console.log(res);

        return res && res[ res.length - 1 ] && res[res.length - 1][0] && res[res.length - 1][0].transcript || '';
    }

    matchCommands(result) {
        

        const commands = this.commands;

        result = result.trim();

        for(let i=0; i<commands.length; i++) {
            const command = commands[i];
            if(typeof command != 'object') {
                console.log("wut?");
                continue;
            }

            if(result.match(command.regex)) {
                return Object.assign(command, {
                    matches : result.match(command.regex)
                });
            }
        }

        return null;
    }
}