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

    get activeSong() {
        return this.__activeSong;
    }

    set activeSong(song) {
        this.__activeSong = song;

        this.setActive(song || {video_id : song});
    }

    localData() {
        let data = localStorage.getItem( this.__localStrName );
        try {
            return data != null ? JSON.parse(data) : [];
        }
        catch (e) {
            return [];
        }
    }

    storeData(data) {
        return localStorage.setItem(this.__localStrName, JSON.stringify(data));
    }


    get list() {
        return this.__list = this.__list || this.localData();
    }

    set list(data) {
        
        this.__list = data;
        return this.storeData(data);
        
        const obj = [];
        $(data).each((key,val) => {
            val = Object.assign({}, val);
            delete val.url;
            delete val.generatedAt;
            obj[key] = val;
        });
        this.__list = data;
        return this.storeData(obj);
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
        this.dom.searchResults.on("click", ".list-group-item,.result .play", function (e) {
            let data;
            if(this.className.match(/fas .*play/i)) {
                data = $(this).parent(".result").data("meta");
            }
            else {
                data = $(this).data("meta");
            }
            
            _this.addToList(data);
            _this.generateAndPlay(data);

        }).on('click', '.result .addToList', function (e) {
            const data = $(this).parent(".result").data("meta");

            _this.addToList(data);
        });

        this.generateState = 0;
        this.searchState = 0;
        this.activeSong = 0;

        this.buttonEventHandler();

        this.renderList();
    }

    buttonEventHandler() {
        if(!this.dom || !this.dom.buttons) {
            return ;
        }

        const btns = this.dom.buttons;

        btns.next.click(e => this.next());
        btns.prev.click(e => this.prev());
        btns.forward.click(e => this.player.forward());
        btns.backward.click(e => this.player.rewind());
        btns.shuffle.click(e => {
            let list = this.list;
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            this.list = list;

            this.renderList();

            this.activeSong = this.activeSong;
        });
        btns.download.click(e => {
            const a = document.createElement("a");
            a.href = this.activeSong.url;

            a.target = "_blank";
            a.download = true;

            document.body.appendChild(a);

            a.style.display = 'none';

            a.click();

            setTimeout(() => {
                a.parentNode.removeChild(a);
            },2500);
        });
    }
    
    /**
     * Generate url & play the song
     * @param {Object} data Song Data
     * @param {String} data.video_title Song Name
     * @param {String} data.video_id Youtube/Spotify Id
     */
    generateAndPlay(data) {
        this.toast(data);

        if(data.url && data.generatedAt && Date.now() - data.generatedAt < 10 * 60 * 1000) {
            return this.playSong(data);
        }
        
        return this.generateUrl(data.video_id)
        .then(url => {
            data.url = url;
            data.generatedAt = Date.now();

            this.list = this.list.map(obj => {
                if(obj.video_id == data.video_id) {
                    obj = data;
                }
                return obj;
            });//save list

            this.playSong(data);
        });
    }

    
    /**
     * Show toast to user
     * @param {Object} data Song Data
     * @param {String} data.video_title Song Name
     * @param {String} data.video_id Youtube/Spotify Id
     */
    toast(data) {
        const el = $(document.createElement("div"))
        .addClass("toast")
        .append(`<div class='toast-body' >Loading ${data.video_title}! <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close"></button></div>`)
        // .addClass("toast-right")

        this.dom.toastHolder.append(el);

        el
        .toast({delay : 3000})
        .toast("show")
        .on("hidden.bs.toast", (e) => {
            el.remove();
        });
    }

    /**
     * Generate url of given song
     * @param {String} id Video Id of Song
     * @param {Boolean} stateManagement 
     */
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

    /**
     * 
     * @param {String} query Search String
     */
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
                src : data.url,// + (data.url.indexOf("?") > -1 ? "&" : "?") + "rand=" + Math.random(),
            }]
        };

        this.player.once('canplay', () => {
            this.player.play().catch(err => {});
        });

        data.image = this.getImage(data);
        this.player.poster = data.image;
        this.dom.poster.prop("src", data.image);

        this.activeSong = data;

        this.dom.songTitle.html(`Playing - ${data.video_title}`);
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


    /**
     * Search Songs and display the results
     */
    searchSongs() {
        const val = this.dom.searchInput.val().trim();

        if(val.length < 1) {
            return ;
        }

        const spinnerClasses = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];

        const state = this.searchState = Math.random();
        
        this.dom.searchResults.html(`<span class='spinner-border text-${spinnerClasses[ Math.floor(Math.random()* (spinnerClasses.length-1)) ]|| 'info'}' /> Loading`);

        return this.search(val).then(results => {
            if(this.searchState != state) {
                return ;
            }

            this.dom.searchResults.html('');

            const list = $( document.createElement("div") )//.addClass("list-group");

            results.forEach(result => {
                
                // const li = $(document.createElement("button"))
                // .addClass("list-group-item")
                // .addClass("list-group-item-action")
                const li = $(document.createElement("div")).addClass('result')
                .html(`<img src='${this.getImage(result)}' class='playlist-icon' /> <h5 class='title' >${result.video_title}</h5>  <i class='fas fa-play play' /> <i class='fas fa-plus addToList' />`)
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

    }


    /**
     * Add new song to list at defined pos
     * @param {Object} song Song Data
     * @param {String} song.video_title Song Name
     * @param {String} song.video_id Youtube/Spotify Id
     * @param {Number} pos position to insert at
     */
    addToList(song, pos=-1) {
        const list = this.list;

        if(pos > list.length) {
            pos = list.length;
        }
        else if(pos < 0) {
            pos = list.length - pos + 1;
        }
        
        //check if song already exists in list
        for(let i=0;i<list.length;i++) {
            if(list[i] && list[i].video_id == song.video_id) {
                return null; //dont add cuz exists
            }
        }

        list.splice(pos, 0, song);

        this.list = list; //save

        this.renderList(pos, list);

        this.activeSong = this.activeSong;

        return true;
    }

    
    /**
     * Add new song to list at defined pos
     * @param {Object} song Song Data
     * @param {String} song.video_title Song Name
     * @param {String} song.video_id Youtube/Spotify Id
     * @param {Number} pos position to insert at
     */
    buildNode(song, pos) {
        const el = $(document.createElement("li"))
        .append(`<span class='num' >${ pos+1 < 10 ? '0' + (pos+1) : pos+1 }.</span>`)
        .append(`<span class='title' >${song.video_title}`)
        .append(`<span class='delete' ><i class='fas fa-times-circle' />`)
        .attr("data-id", song.video_id);

        el.find(".fas").click(e => {
            el.remove();
            this.removeFromList(song.video_id);
            e.stopPropagation();
        });

        el.click(e => {
            this.generateAndPlay(song);
            this.activeSong = song;
        });

        return el;
    }


    /**
     * 
     * @param {String} id Video id of the song to remove
     */
    removeFromList(id) {
        this.list = this.list.filter(song => song.video_id != id);
        this.updateNumbers();
    }


    /**
     * Set the song to active
     * @param {Object} song Song Data
     * @param {String} song.video_title Song Name
     * @param {String} song.video_id Youtube/Spotify Id
     */
    setActive(song) {
        
        this.dom.playlist.find("li.active").removeClass("active");

        this.dom.playlist.find(`[data-id='${song.video_id}']`).addClass("active");
    }


    updateNumbers() {
        this.dom.playlist.find('li').each( (i,li) => {
            li = $(li);

            li.find(".num").html( i+1 );
        });
    }

    /**
     * Render playlist
     * @param {Number} [pos] Position which was modified
     * @param {Object} [list] Source playlist
     */
    renderList(pos=null, list=this.list) {
        list = list || [];

        if(pos !== null && list[pos]) {
            const el = this.buildNode(list[pos], pos);

            if(pos != list.length-1) {
                const plList = this.dom.playlist.find("li");
                $(plList[pos]).before(el);
            }
            else {
                this.dom.playlist.append(el);
            }
            
            this.updateNumbers();
            
            this.activeSong = this.activeSong; //reset property

            return ;
        }

        this.dom.playlist.html('');

        list.forEach( (song,i) => {
            
            this.dom.playlist.append(
                this.buildNode(song, i)
            );
        });

        if(list.length < 1){
            this.dom.playlist.html("<div class='alert alert-danger' >Looks like you don't have any songs in your playlist</div>");
        }
    }


    next() {
        const current = this.activeSong;
        const list = this.list;

        let pos = -1;

        for(let i=0;i<list.length;i++) {
            if(current.video_id == list[i].video_id) {
                pos = i;
                break;
            }
        }

        if(pos >= list.length - 1 || !list[pos+1]) {
            pos = -1;
        }

        this.generateAndPlay(list[pos+1]);
    }

    prev() {
        const current = this.activeSong;
        const list = this.list;

        let pos = -1;

        for(let i=0;i<list.length;i++) {
            if(current.video_id == list[i].video_id) {
                pos = i;
                break;
            }
        }

        if(pos <= 0 || !list[pos-1]) {
            pos = list.length;
        }

        this.generateAndPlay(list[pos-1]);
    }
}