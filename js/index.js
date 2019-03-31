$(function () {

    //自定义滚动条
    $(".content_list").mCustomScrollbar();

    let $audio = $('audio');
    let player = new Player($audio);
    let progress;
    let voiceProgress;
    let lyric;


    //1.加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        //var url = 'https://api.bzqll.com/music/tencent/search?key=579621905&s=123&limit=100&offset=0&type=song';
        //let url = `https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8¬ice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=36&_=1520777874472`;
       let url = `https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8¬ice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=27&_=1519963122923`;
        $.ajax({
            //https://api.bzqll.com/music/tencent/search?key=579621905&s=123&limit=100&offset=0&type=song
            /*   说明 : 当前搜索类型支持:
                 1. 音乐搜索:type=song
                 2. 专辑搜索:type=album
                 3. 歌单搜索:type=list (QQ音乐限制歌单每页最多查询50条)
                 4. MV搜索:type=mv
                 5. 用户搜索:type=user
                 6. 歌词搜索:type=lrc
                 No.6 获取音乐图片
                     请求URL: https://api.bzqll.com/music/tencent/pic
                     请求示例: https://api.bzqll.com/music/tencent/pic?key=579621905&id=000NgBjP4PclJ1
                 */
            url: url,
            type: "post",
            dataType: 'jsonp',
            jsonp: "jsonpCallback",
            success: function (data) {
                player.musicList = data.songlist;
               // console.log(data.songlist);
                // console.log(data.songlist[0].data.songname) //歌名
                // console.log(data.songlist[0].data.singer[0].name) //歌手
                // console.log(data.songlist[0].data.interval) //时长
                //遍历获取到的数据
                let $musicList = $('.content_list ul');
                $.each(data.songlist, function (index, ele) {

                   //console.log(ele.data);
                   // console.log(ele.data.songmid);
                    let $item = crataMusicItem(index, ele);
                    $musicList.append($item);
                });
                initMusicInfo(data.songlist[0]);
                initMusicLyric(data.songlist[0]);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }

   // 2.初始化歌曲信息(要修改)
    function initMusicInfo(music) {
        let $musicImage = $('.song_info_pic img'),
            $musicName = $('.song_info_name a'),
            $musicSinger = $('.song_info_singer a'),
            $musicAblum = $('.song_info_ablum a'),
            $musicProgressName = $('.music_progress_name'),
            $musicProgressTime = $('.music_progress_time'),
            $musicBg = $('.mask_bg');

        //给获取的元素赋值
        let musicImages = `https://api.bzqll.com/music/tencent/pic?id=${music.data.songmid}&key=579621905`;
        $musicImage.attr('src',musicImages);
        $musicName.text(music.data.singer[0].name);
        $musicSinger.text(music.data.songname);
        $musicAblum.text(music.data.albumname);
        $musicProgressName.text(music.data.singer[0].name + "/" + music.data.songname);
        $musicProgressTime.text("00:00 /" + formatDate2(music.data.interval));
        $musicBg.css("background", "url('" + musicImages + "')");
    }

    //2.初始化歌词信息
    function initMusicLyric(music) {
        let lyricGet = `https://api.bzqll.com/music/tencent/lrc?id=${music.data.songmid}&key=579621905`;
        lyric = new Lyric(lyricGet);
        let $lryicContainer = $('.song_lyric');
         //清空上一首音乐的歌词
        $lryicContainer.html("");
            lyric.loadLyric(function () {

                //创建歌词列表
                $.each(lyric.lyrics,function (index,ele) {
                    let $item = $("<li>"+ele+"</li>");
                    $lryicContainer.append($item);
                });

            });
    }
    //3.初始化进度条
    initProgress();
    function initProgress() {

        let $progressBar = $('.music_progress_bar'),
            $progressLine = $('.music_progress_line'),
            $progressDot = $('.music_progress_dot');

        progress = Progress($progressBar,$progressLine,$progressDot);

        //调用progress.js件事
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress. progressMove(function (value) {
            player.musicSeekTo(value);
        });

        let $voiceBar = $('.music_voice_bar'),
            $voiceLine = $('.music_voice_line'),
            $voiceDot = $('.music_voice_dot');

        voiceProgress = Progress($voiceBar,$voiceLine, $voiceDot);
        //调用progress.js件事
        voiceProgress.progressClick(function (value) {
             player.musicVoiceSeekTo(value);
        });
        voiceProgress. progressMove(function (value) {
             player.musicVoiceSeekTo(value);
        });
    }

    //4.初始化事件监听
    initEvents();
    function initEvents() {
        //1.监听歌曲的移入移出事件
        $(".content_list").on("mouseenter", ".list_music", function () {

            $(this).find('.list_menu').stop().fadeIn(100);
            $(this).find('.list_time a').stop().fadeIn(100);
            //隐藏时长
            $(this).find('.list_time span').stop().fadeOut(100);
        });
        $(".content_list").on("mouseleave", ".list_music", function () {
            $(this).find('.list_menu').stop().fadeOut(100);
            $(this).find('.list_time a').stop().fadeOut(100);
            $(this).find('.list_time span').stop().fadeIn(100);
        });

        //2.监听复选框的点击事件
        $(".content_list").on("click", ".list_check", function () {
            $(this).toggleClass('list_checked')
        });


        //3.添加子菜单播放按钮的监听
        let $musicPlay = $('.music_play');

        $(".content_list").on("click", ".list_menu_play", function () {

            let $item = $(this).parents('.list_music');

            // console.log($item.get(0).index);
            // console.log($item.get(0).music);

            //切换图标
            $(this).toggleClass('list_menu_play2');

            $item.siblings().find('.list_menu_play').removeClass('list_menu_play2');
            //播放按钮同步
            if ($(this).attr('class').indexOf('list_menu_play2') !== -1) {
                //当前子菜单的播放按钮是播放状态
                $musicPlay.addClass('music_play2');
                //文字高亮

                $item.find('div').css("color", "#fff");

                $item.siblings().find('div').css("color", "rgba(225, 255, 255, .5)");
            } else {
                //当前子菜单的播放按钮是不播放状态
                $musicPlay.removeClass('music_play2');
                //文字不高亮

                $item.find('div').css("color", "rgba(225, 255, 255, .5)");

            }
            //切换序号的状态
            $item.find('.list_number').toggleClass('list_number2');

            $item.siblings().find('.list_number').removeClass('list_number2');

            //3.5播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);

            //3.6 切换歌曲信息
            initMusicInfo($item.get(0).music);
            //3.6 切换歌词信息
            initMusicLyric($item.get(0).music);


        });
        //监听底部控制区域上一首按钮的点击
        $musicPlay.click(function () {
            //判断有没有播放音乐
            if (player.currentIndex === -1) {
                //没有播放的音乐
                $('.list_music').eq(0).find('.list_menu_play')
                    .trigger('click');

            } else {
                //播放的音乐
                $('.list_music').eq(player.currentIndex).find('.list_menu_play')
                    .trigger('click');

            }

        });
        //5.监听底部控制区域上一首按钮的点击
        $('.music_pre').click(function () {

            $('.list_music').eq(player.preIndex()).find('.list_menu_play').trigger('click');

        });
        //6.监听底部控制区域下一首按钮的点击
        $('.music_next').click(function () {

            $('.list_music').eq(player.nextIndex()).find('.list_menu_play').trigger('click');
        });

        //7.监听删除按钮的点击
        $('.content_list').on('click', '.list_menu_del', function () {
            //找到被点击的音乐
            let $item = $(this).parents('.list_music');
            // console.log($item);
            //判断当前删除的是否是正在播放的
            if ($item.get(0).index === player.currentIndex) {
                $('.music_next').trigger('click');
            }

            $item.remove();
            player.changeMusic($item.get(0).index);

            //重新排序
            $('.list_music').each(function (index, ele) {
                ele.index = index;
                $(ele).find('.list_number').text(index + 1);

            });
        });

        //8.监听播放进度
        player.musicTimeUpdate(function (currentTime,duration,timeStr) {
            //同步时间
            $('.music_progress_time').text(timeStr);
            //同步进度条
            //计算播放比例
             let value = currentTime / duration*100;
             progress.setProgress(value);

            //歌词同步
            let index = lyric.currentIndex(currentTime);

            let $item =  $('.song_lyric li').eq(index);
             $item.addClass("cur");
             $item.siblings().removeClass("cur");

            if (index <= 2) return;

            $('.song_lyric').css({
               marginTop:(-index + 2) * 30
            });

        });

        //9.监听声音按钮的点击
        $('.music_voice_icon').click(function () {

            $(this).toggleClass('music_voice_icon2');
            //声音的切换
            if ($(this).attr('class').indexOf('music_voice_icon2') !== -1) {
                //声音变为静音
                player.musicVoiceSeekTo(0);

            }else {
                //有声音
                player.musicVoiceSeekTo(1);
            }
        });

        //10.监听底部点击切换事件
        $('.music_fav').click(function () {
            $(this).toggleClass('music_fav2');
        });
        $('.music_only').click(function () {
            $(this).toggleClass('music_only2');
        });

        $('.music_mode').click(function () {
            $(this).toggleClass('music_mode2');
        });

    }

    //定义一个方法创建音乐
    function crataMusicItem(index, music) {
        let $item;
        $item = $(`
        <li class="list_music">
        <div class="list_check"><i></i></div>
        <div class="list_number">${index + 1}</div>
        <div class="list_name">${music.data.songname}
            <div class="list_menu">
                <a href="javascript::" title="播放" class="list_menu_play"></a>
                <a href="javascript::" title="添加"></a>
                <a href="javascript::" title="下载"></a>
                <a href="javascript::" title="分享"></a>
            </div>
        </div>
        <div class="list_singer">${music.data.singer[0].name}</div>
        <div class="list_time">
            <span>${ formatDate2(music.data.interval)}</span>
            <a href="javascript::" title="删除" class="list_menu_del"></a>
        </div>
        </li>
        `);
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }

    //定义一个格式化时间的发法
       function formatDate2(duration1){
           let endMin1 = parseInt(duration1 / 60);
           let endSec1 = parseInt(duration1 % 60);
           if (endMin1 < 10){
               endMin1 = "0" + endMin1;
           }
           if (endSec1 < 10){
               endSec1 = "0" + endSec1;
           }
           return endMin1 + ":" + endSec1;
       }
});