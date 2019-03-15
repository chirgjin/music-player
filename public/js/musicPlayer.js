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

    localData() {
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






    /**
     * 
     * @param {PlyrElement} player 
     * @param {Object} dom 
     * @param {JQueryObject} dom.poster
     * @param {JQueryObject} dom.searchInput
     * @param {JQueryObject} dom.searchResults
     * @param {JQueryObject} dom.searchBtn
     * @param {JQueryObject} dom.playlist
     * @param {JQueryObject} dom.toastHolder
     * 
     */
    constructor(player, dom) {
        this.data = this.localData();
        this.player = player;
        this.dom = dom;

        this.dom.searchBtn.click(e => this.searchSongs());
        this.dom.searchInput.on("keydown", e => e.keyCode === 13 && this.searchSongs() || 1);

        const _this = this;
        this.dom.searchResults.on("click", ".list-group-item", function (e) {
            const data = $(this).data("meta");
            _this.toast(data);

            _this.generateUrl(data.video_id).then(url => {
                _this.playSong(Object.assign(data, { url : url}));
            });
        });

        this.generateState = 0;
        this.searchState = 0;
    }

    toast(data) {
        const el = $(document.createElement("div"))
        .addClass("toast")
        .append(`<div class='toast-body' >Loading ${data.video_title}! <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close"></button></div>`)
        // .addClass("toast-right")

        this.dom.toastHolder.append(el);

        el
        .toast("show")
        .on("hidden.bs.toast", (e) => {
            el.remove();
        });
    }


    generateUrl(id, stateManagement=true) {
        let state;
        
        if(stateManagement) {
            state = this.generateState = Math.random();
        }

        return Promise.resolve().then(() => {
            return $.post(this.downloadUrl, { videoId : id})
        }).then(data => {
            if(!data || data.status !== 'success') {
                throw data.data;
            }
            else if(stateManagement && state != this.generateState) {
                throw new Error("Generate state didn't match");
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
    /**
     * 
     * @param {Object} data Data of song
     * @param {String} data.video_title Title of song
     * @param {String} data.url Url of Song
     * @param {String} [data.video_id] Id of video
     * @param {String} [data.image] Poster of song
     */
    playSong(data) {
        this.player.source = {
            title : data.video_title,
            type : 'audio',
            sources : [{
                src : data.url + (data.url.indexOf("?") > -1 ? "&" : "?") + "rand=" + Math.random(),
            }]
        };

        this.player.once('canplay', () => {
            this.player.play().catch(err => alert("Cant play song :/"));
        });

        data.image = this.getImage(data);
        this.player.poster = data.image;
        this.dom.poster.prop("src", data.image);
    }

    /**
     * 
     * @param {Object} data 
     * @param {String} data.video_id
     * @param {String} [data.image]
     */
    getImage(data) {
        return  data.image || `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`;
    }
    /**
     * 
     * @param {Number} change 
     */
    speed(change) {
        if(!change) {
            throw new Error("Change is required & can't be 0");
        }

        const speeds = this.player.options.speed;
        let index = speeds.indexOf( this.player.speed );

        index = Math.min(speeds.length-1, Math.max(0, index + change));

        if(speeds[index]) {
            this.player.speed = speeds[index];
        }
    }


    
    searchSongs() {
        const val = this.dom.searchInput.val().trim();

        if(val.length < 1) {
            return ;
        }

        const spinnerClasses = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];

        const state = this.searchState = Math.random();
        
        this.search(val).then(results => {
            if(this.searchState != state) {
                return ;
            }

            this.dom.searchResults.html('');

            const list = $( document.createElement("div") ).addClass("list-group");

            results.forEach(result => {
                
                const li = $(document.createElement("button"))
                .addClass("list-group-item")
                .addClass("list-group-item-action")
                .html(`<img src='${this.getImage(result)}' class='playlist-icon' /> ${result.video_title}`)
                .data("meta", result);

                list.append(li);
            });

            this.dom.searchResults.html(list);
            
        }).catch(err => {
            if(this.searchState != state) {
                return ;
            }

            this.dom.searchResults.html("<div class='alert alert-danger' >Couldn't contact server</div>");
        });

        this.dom.searchResults.html(`<span class='spinner-border text-${spinnerClasses[ Math.floor(Math.random()* (spinnerClasses.length-1)) ]|| 'info'}' /> Loading`);
    }
}