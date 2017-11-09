/**
 * @fileOverview  边栏锚点菜单
 * @author daiying.zhang
 */
;(function($){
    /**
     * 锚点菜单插件
     * @param {Object} options 配置参数
     * @param {String} [options.target='[data-sidenav="true"]'] 要提取为菜单项的选择器
     * @param {Number} [options.deviation=100]  距离偏差，单位:px
     * @param {Number} [options.jumpSpeed=600]  滚动速度，单位:ms
     * @param {String} [options.defaultPos=""]  初始化时滚动到的位置
     * @returns {jQuery}
     */
    $.fn.sidenav = function(options){

        options = $.extend({
            target : '[data-sidenav="true"]',
            deviation : 100,            //内容区域距离屏幕顶部的高度偏差
            jumpSpeed : 400,            //滚动速度
            defaultPos : '',            //默认滚动到的位置的ID
            autoRender : true,          //是否由程序渲染菜单
            itemClass : 'js-sindenav-item', //菜单项要附加的class
            fixedClass : '',            //菜单固定时的class
            currentClass : 'current',   //当前高亮菜单的class
            fixedDeviation : 20,        //菜单距离屏幕顶部高度小于此值时固定
            renderTmpl : '<a href="javascript:;">{{text}}</a>'
        },options);

        /**
         * 跳转到相应位置
         * @param {String} position 位置的id
         */
        function jumpTo(position){
            var $ele = $node.data('navs')[position];
            console.log($ele)
            $ele && $ele.offset && $('html,body').animate({ 'scrollTop' : $ele.offset().top },
                options.jumpSpeed,
                function(){
                    highlightNav(position);
                }
            );
        }

        /**
         * 设置当前的菜单项
         * @param {String} position 位置的id
         */
        function highlightNav(position){
            var cls = options.currentClass;
            $node.find('.' + cls).removeClass(cls).end()
                .find('[data-hash="' + position + '"]').addClass(cls);
        }

        function setCurrNav(){
            var posObj = {};
            var scrollTop = 0,
                $body = $('body');
            if($node){
                posObj = $node.data('navs');
                //IE下面要用$('html')
                scrollTop = $body.scrollTop() || $('html').scrollTop();

                if($.isEmptyObject(posObj)){
                    return;
                }
                //确保导航菜单不会滚动到可视区域之外
                if(options.fixedClass){
                    if(scrollTop - $node.data('origPos') > -20){
                        $node.addClass('sidenav-fix');
                    }else{
                        $node.removeClass('sidenav-fix');
                    }
                }

                //压根儿就没有滚动条
                //console.log($body[0].scrollHeight,$body[0].clientHeight);
                //if($body[0].scrollHeight === $body[0].clientHeight){
                    //return
                //}
                $.each(posObj,function(key, val){
                    //console.log('dddd');
                    //key为位置的id，val为对应的DOM节点
                    if(Math.abs(val.offset().top - scrollTop) <= options.deviation){
                        highlightNav(key);
                    }
                });
            }
        }
        var $node = null;
        $(window).on('scroll',function(eve){
            setCurrNav();
        });

        return this.each(function(){
            var $this = $(this),
                targets = $(options.target),
                html=[],
                $children = null,
                tmpl = options.renderTmpl;
            $this.data('navs',{});
            options.fixedClass && $this.data('origPos', $this.offset().top);
            $node = $this;

            var tmpNode = $('<div></div>');
            
            //提取菜单项
            if(options.autoRender === true){
                targets.each(function(idx){
                    var $node = $(this);
                    //存储位置
                    //$this.data('navs')[this.id] = $node.offset().top;
                    var id = this.id;
                    if(!id){
                        $(this).attr('id' ,id = ('sidenav' + Math.random()).replace('0.',''));
                    }
                    //存储DOM节点
                    $this.data('navs')[id] = $node;
                    $(tmpl.replace(/{{\s*text\s*}}/g,$node.text()).replace(/{{\s*index\s*}}/g,idx))
                        .attr('data-hash',id)
                        .addClass(options.itemClass)
                        .appendTo(tmpNode)
                });
                $this.html(tmpNode.html());
                $children = $this.children();
            }else{
                $children = $this.children()
                .addClass(options.itemClass)
                .each(function(){
                    var id = $(this).data().hash;
                    $this.data('navs')[id] = $('#' + id);
                });
            }
            //设置最后一个元素的class
            $children.last().addClass('last').end();

            //绑定菜单项的click事件
            $node.on('click', '.' + options.itemClass, function(eve){
                console.log('click');
                eve.preventDefault();
                var target = $(eve.currentTarget),
                    hash = target.data().hash;
                jumpTo(hash);
            });

            //默认跳转的位置
            //jumpTo(options.defaultPos || $children.first().data().hash)
            options.defaultPos && jumpTo(options.defaultPos);
        });
    };
})(jQuery);