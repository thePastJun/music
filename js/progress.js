(function (window) {

    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    }

    Progress.prototype = {

        constructor: Progress,
        init: function ($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove:false,
        progressClick: function (callBack) {
            let $this = this;// this指的是progress
            //监听背景的点击
            this.$progressBar.click(function (event) {
                //获取背景距离窗口默认的位置
                let normalLeft = $(this).offset().left; //这里的this是click的点击事件$progressBar的
                // console.log(normalLeft);
                //获取点击的位置距离窗口的位置
                let eventLeft = event.pageX;
                // console.log(eventLeft);
                //设置前景的宽度
                $this.$progressLine.css('width', eventLeft - normalLeft);
                $this.$progressDot.css('left', eventLeft - normalLeft);
                //计算进度条的比例
                let value = (eventLeft - normalLeft) / $(this).width();
                callBack(value);
            });
        },
        progressMove: function (callBack) {
            let $this = this;
            //获取背景距离窗口默认的位置
            let normalLeft = this.$progressBar.offset().left;
            let barWidth = this.$progressBar.width();
            let eventLeft;
            //监听鼠标按下事件
            this.$progressBar.mousedown(function () {
                  $this.isMove = true;

                //2.监听点击鼠标的移动事件
                $(document).mousemove(function (event) {
                    //获取点击的位置距离窗口的位置
                    eventLeft = event.pageX;
                    // console.log(eventLeft);
                    let offset = eventLeft - normalLeft;
                    if (offset >= 0 && offset <= barWidth) {
                        //设置前景的宽度
                        $this.$progressLine.css('width',offset);
                        $this.$progressDot.css('left',offset);
                    }


                });

            });
            //3.监听鼠标的抬起事件
            $(document).mouseup(function () {
                //移除事件
                $(document).off('mousemove');
                $this.isMove = false;
                //计算进度条的比例
                let value = (eventLeft - normalLeft) / $this.$progressBar.width();
                callBack(value);

            });


        },
        setProgress: function (value) {
            if (this.isMove) return;
            if (value < 0 || value > 100) return;
            this.$progressLine.css({
                width: value + "%"
            });
            this.$progressDot.css({
                left: value + "%"
            });

        }

    };
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);