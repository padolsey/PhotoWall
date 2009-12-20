


PhotoWall = (function() {
    
    var defaults = {
        width: 800,
        height: 300,
        maxImgWidth: 200,
        minImgWidth: 5,
        maxImgHeight: 200,
        minImgHeight: 5,
        imgs: [],
        inject: function() {}
    };
    
    var createElement = (function(){
        
        return function(type, attrs) {
            
            var el = document.createElement(type),
                attr, css, event, events;
            
            if (attrs) {
                
                css = attrs.css;
                
                if (css) {
                    for (var prop in css) {
                        if (!css.hasOwnProperty || css.hasOwnProperty(prop)) {
                            try{
                                el.style[prop] = typeof css[prop] === 'string' ? css[prop] : css[prop] + 'px';
                            } catch(e) { /* Invalid props */ }
                        }
                    }
                }
                
            }
            
            for (attr in attrs) {
                if (!attrs.hasOwnProperty || attrs.hasOwnProperty(attr)) {
                    if (attr !== 'css') {
                        el[attr] = attrs[attr];
                    }
                }
            }
            
            return el;
        };
        
    })();
    
    function merge(target, source) {
        
        if ( typeof target !== 'object' ) {
            target = {};
        }
        
        for (var property in source) {
        
            if ( source.hasOwnProperty(property) ) {
                
                var sourceProperty = source[ property ];
                
                if ( typeof sourceProperty === 'object' ) {
                    target[ property ] = merge( target[ property ], sourceProperty );
                    continue;
                }
                
                target[ property ] = sourceProperty;
                
            }
        
        }
        
        for (var a = 2, l = arguments.length; a < l; a++) {
            merge(target, arguments[a]);
        }
        
        return target;
    }
    
    function rand(min, max) {
        return Math.floor( Math.random() * (max - min - 1) + min );
    }
    
    function fill(arr, start, end, fn) {
        
        // Fills a portion (start>end) of an array
        // with fn, or if fn's a function, fn();
        
        var isFn = typeof fn === 'function';
        
        for(var i = start; i < end; ++i) {
            arr[i] = isFn ? fn() : fn;
        }
        
        return arr;
    
    }
    
    function sortHighest(a,b) {
        
        // Sort so points with lowest Y values are pushed
        // to front.
        
        if ( a.y === b.y ) {
            // Both are equal, go for the left-most one
            return a.x - b.x;
        }
        
        return a.y - b.y// + (a.x - b.x);
    }
    
    function PhotoWall(ops) {
        
        ops = merge(defaults, ops);
        
        var container = createElement('div', {
                styles: {
                    width: typeof ops.width === 'string' ? ops.width : ops.width + 'px',
                    height: typeof ops.height === 'string' ? ops.height : ops.height + 'px',
                    position: 'relative'
                }
            }),
            imgs = ops.imgs,
            
            width = parseFloat(ops.width),
            height = parseFloat(ops.height),
            
            highestPoints = [{x:0,y:0}],
            occupied = [];
            
        // Fill with empty arrays x
        fill(occupied, 0, height, function(){
            return fill([], 0, width, false);
        });
        
        function getNewPosition( whRatio ) {
            
            var highestPoint = highestPoints.shift();
            
            if ( !highestPoint ) {
                return null;
            }
            
            var x = highestPoint.x,
                y = highestPoint.y,
                wx = x,
                hy = y,
                position = {};
            
            while (
                occupied[y+1] &&
                occupied[y+1][++wx] === false &&
                wx - x < ops.maxImgWidth && // Max width check
                Math.round((wx-x) / whRatio) < Math.min(ops.maxImgHeight, height-y) // Max height check
            ) {}
            
            position = {
                top : y,
                left: x,
                width: wx - x,
                height: Math.round((wx-x) / whRatio)
            };
            
            if (position.width < ops.minImgWidth || position.height < ops.minImgHeight) {
                return getNewPosition( whRatio );
            }
            
            var hy = position.height + y;
            
            for( var i = y; i < hy; ++i) {
                if (occupied[i]) fill(
                    occupied[i],
                    x,
                    wx,
                    true
                );
            }
            
            //if (!window.l) {console.log(occupied.toString());window.l = true;}
            
            highestPoints.push({
                x: wx < width ? wx : 0,
                y: wx < width ? y : hy
            });
            
            if ( hy < height ) {
                highestPoints.push({
                    x: x,
                    y: hy
                });
                highestPoints.push({
                    x: wx,
                    y: hy
                });
            }
            
            highestPoints.sort(sortHighest);
            
            return position;
            
        }
        
        var imgHeight = 0,
            imgWidth = 0,
            imgDims = [],
            loaded = 0,
            img,
            loadedFn = function(i) {
                return function() {
                    imgDims[i] = {
                        width: this.width || this.naturalWidth,
                        height: this.height || this.naturalHeight
                    };
                    this.parentNode.removeChild(this);
                    if (++loaded === len) {
                        init();
                    }
                    try {
                        delete this.onload;
                    } catch(e) {
                        this.onload = null;
                    }
                };
            };
            
        for (var i = 0, len = imgs.length; i < len; ++i) {
            
            img = createElement('img', {
                src: imgs[i],
                css: { position: 'absolute', top: -9999, left: -9999 }
            });
            
            document.body.insertBefore(img, document.body.firstChild);
            
            // Wait for img to load, before derermining dimensions
            if ( img.complete ) {
                loadedFn(i).call(img);
            } else {
                img.onload = loadedFn(i);
            }
            
        }
        
        function init() {
            
            var i = -1,
                position,
                cur,
                curImg;
            
            function next() {
                return imgs[i + 1 >= imgs.length ? i = 0 : ++i];
            }
            
            while (
                cur = next(),
                position = getNewPosition(
                    imgDims[i].width / imgDims[i].height
                )
            ) {
                
                curImg = createElement('img', {
                    src: cur,
                    css: merge({
                        position: 'absolute'
                    }, position)
                });
                //console.log(imgDims[i].width / imgDims[i].height);
                container.appendChild(curImg);
                
            }
            
            ops.inject.call(container);
            
        }
        
    };
    
    PhotoWall.defaults = defaults;
    
    return PhotoWall;
    
})();

























