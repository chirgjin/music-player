(() => {
    jQuery(document).ready(e => {
        const sp = new SpeechRecog();
        const fns = {
            'play' : console.log
        };

        sp.start();
        sp.addEventListener('result', e => {

            console.log(e.command);
        });

        window.pl = new Plyr('#player', {
            settings : ['loop', 'speed'],
            keyboard : {
                global : true
            }
        });

        window.mp = new MusicPlayer;
        let res;

        mp.search('Beach House').then(results => {
            res = results[1];
            return mp.generateUrl(res.video_id);
        }).then(url => {

            pl.source = {
                title : res.video_title,
                type : 'audio',
                sources : [
                    {
                        src : url
                    }
                ]
            };

            pl.play();

            $("#poster").prop("src", `https://img.youtube.com/vi/${res.video_id}/hqdefault.jpg`);
        });

    });

    class MusicPlayer {
        get apiUrl() {
            return '/api';
        }
        get searchUrl() {
            return `${this.apiUrl}/search`;
        }
        get downloadUrl() {
            return `${this.apiUrl}/download`;
        }

        get __localStrName() {
            return 'music-data';
        }

        get localData() {
            let data = localStorage.getItem( this.__localStrName );
            try {
                return data != null ? JSON.parse(data) : {};
            }
            catch (e) {
                return {};
            }
        }

        storeData(data) {
            return localStorage.setItem(this.__localStrName, JSON.stringify(data));
        }
        
        constructor() {

        }

        generateUrl(id) {
            return Promise.resolve().then(() => {
                return $.post(this.downloadUrl, { videoId : id})
            }).then(data => {
                if(!data || data.status !== 'success') {
                    throw data.data;
                }

                return data.data.download_link;
            });
        }

        search(query) {
            return Promise.resolve().then(() => {
                return $.post(this.searchUrl, { query : query})
            }).then(data => {
                if(!data || data.status !== 'success') {
                    throw data.data;
                }

                return data.data;
            });
        }
        
    }
})();