(function() {
    var bpplVersion="0.1";

    function validate() {
        //Make sure bookmarklet is uptodate
        if ( window.bpplBmVersion == undefined || window.bpplBmVersion != bpplVersion ) {
            window.alert("Your bookmarklet is out of date. Please update by following the steps in the article shown next.");
            document.location.href="https://medium.com/@freshtechno/beatport-link-playlists-d37a7c12ade9?source=bookmarklet";
            throw new Error("Bookmarklet version conflict");
        }

        //Make sure on beatport & window.Beatport defined
        if ( typeof window.Beatport == 'undefined' ) {
            window.alert("You have to run this bookmarklet on Beatport.");
            throw new Error("window.Beatport not defined");
        }

        //Make sure logged in
        if ( !window.Beatport.user.isLoggedIn || typeof Beatport.user.introspect.subscription == 'undefined' ) {
            window.alert("To make easy Beatport Link playlists you need to be logged in to Beatport. You will be redirected there now.");
            document.location.href="https://www.beatport.com/account/login";
            throw new Error("To make easy Beatport Link playlists you need to be logged in to Beatport.");
        }

        //Make sure library is available
        if ( !Beatport.user.introspect.subscription.includes('bp_link') ) {
            window.alert("It doesnt look like you are subscribed to Beatport Link. Ill redirect to where you can signup.");
            document.location.hef="https://www.beatport.com/get-link";
            throw new Error("It doesnt look like you are subscribed to Beatport Link as there is no Library link");
        }        
    }

    function run() {
        validate();

        try {
            var tracks=[];

            //TODO: Check on correct page
            if ( document.location.href.includes('/top-100') || document.location.href.includes('beatport.com/chart/') | document.location.href.includes('beatport.com/release/') ) {
                //Get tracks from chart page
                document.querySelectorAll('li.track').forEach(function(e){
                    tracks.push(parseInt(e.getAttribute('data-ec-id')));
                });
            } else if ( document.location.href.includes('/cart/') ) {
                //Get tracks from Crate
                document.querySelectorAll('.cart-tracks button.track-play').forEach(function(e){
                    tracks.push(parseInt(e.getAttribute('data-id')));
                });
            } else {
                throw new Error("You can not create playlists from this page. At the moment you can only use Cart pages or Chart pages.");
            }

            //Get playlist ID
            var playlist = parseInt(window.prompt("What is ther Playlist ID to you want to add the "+tracks.length+" tracks to?",0));

            //Make sure playlist is valid value
            if ( playlist == undefined || playlist == null || playlist == 0 ) {
                alert("You have entered an invalid playlist ID. Ill redirect you to the playlists page now. Just click on the playlist you want to use and copy the number at the end of the URL!");
                document.location.href="/library/playlists";
                throw new Error('You entered an invalid playlist ID');
    }

            //Import tracks
            var api="/api/v4/my/playlists/"+playlist+"/tracks/bulk";
            var myHeaders = new Headers();
            myHeaders.set('Content-Type', 'application/json');
            initData={
                method:"POST",
                headers: myHeaders,
                body:JSON.stringify({'track_ids':tracks})
            };

            fetch(api,initData).then(function(response) {
                if (!response.ok) {
                    if ( response.status=='404' ) {
                        alert("You have no persmissions to edit this playlist, make sure you are logged in and used the correct ID. Ill redirect you to the playlists page now. Just click on the playlist you want to use and copy the number at the end of the URL!");
                        document.location.href="/library/playlists";
                    }
                    throw new Error('HTTP error, status = ' + response.status);
                }
                return response.blob();
            }).then(function(response) {
                if ( window.confirm("Tracks imported to your Beatport Link playlist ðŸ¥³ðŸ”Š. Would you like me to email you when we update this little tool of magic?") ) {
                    fetch("https://hooks.zapier.com/hooks/catch/106993/oou76ox/silent/?email="+encodeURIComponent(window.Beatport.user.email_address)+"&name="+encodeURIComponent(window.Beatport.user.name.first+" "+window.Beatport.user.name.last)+"&orders="+encodeURIComponent(window.Beatport.user.total_orders)+"&tracks="+encodeURIComponent(tracks.length));
                } else {
                    fetch("https://hooks.zapier.com/hooks/catch/106993/oou76ox/silent/?email=&name=&orders=&tracks="+encodeURIComponent(tracks.length));
                }
                window.alert("If you like this please drop us a message on Instagram @freshtechno. I will redirect you now to the playlist page.");
                document.location.href="/library/playlists/"+playlist;
            });
        } catch (e) {
            console.log(e.name + ': ' + e.message);
            window.alert(e.message);
        }
    }

    var original = window.BPPL;
    var self = (window.BPPL = {
        run: run,
        noConflict: function() {
            window.BPPL = original;
            return self;
        }
    });
})();
