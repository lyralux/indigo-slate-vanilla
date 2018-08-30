( function( window ) {

    'use strict';

    function extend( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    // taken from https://github.com/inuyaksa/jquery.nicescroll/blob/master/jquery.nicescroll.js
    function hasParent( e, id ) {
        if (!e) return false;
        var el = e.target||e.srcElement||e||false;
        while (el && el.id != id) {
            el = el.parentNode||false;
        }
        return (el!==false);
    }

    // returns the depth of the element "e" relative to element with id=id
    // for this calculation only parents with classname = waypoint are considered
    function getLevelDepth( e, id, waypoint, cnt ) {
        cnt = cnt || 0;
        if ( e.id.indexOf( id ) >= 0 ) return cnt;
        if( classie.has( e, waypoint ) ) {
            ++cnt;
        }
        return e.parentNode && getLevelDepth( e.parentNode, id, waypoint, cnt );
    }

    // http://coveroverflow.com/a/11381730/989439
    function mobilecheck() {
        var check = false;
        (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    // returns the closest element to 'e' that has class "classname"
    function closest( e, classname ) {
        if( classie.has( e, classname ) ) {
            return e;
        }
        return e.parentNode && closest( e.parentNode, classname );
    }

    function MenuApp( el, trigger, options ) {
        this.el = el;
        this.trigger = trigger;
        this.options = extend( this.defaults, options );
        // support 3d transforms
        this.support = Modernizr.csstransforms3d;
        if( this.support ) {
            this._init();
        }
    }

    MenuApp.prototype = {
        _init : function() {
            // if menu is open or not
            this.open = false;

            this.level = 0;

            this.levels = Array.prototype.slice.call( this.el.querySelectorAll( '.menu' ) );

            var self = this;

            this.levels.forEach( function( el, i ) {
                var levelDepth = getLevelDepth(el, self.el.id, 'menu');
                el.setAttribute( 'data-level', levelDepth);
                var className = 'level_' + levelDepth;
                if(levelDepth === 3) {
                    el.setAttribute('data-height', el.offsetHeight);
                    el.setAttribute('data-collapsed', true);
                    classie.add(el, 'collapse');
                }
                classie.add(el, className);
            } );
            // the menu items
            this.menuItems = Array.prototype.slice.call( this.el.querySelectorAll( '.menu_item' ) );

            this.menuClose = Array.prototype.slice.call(this.el.querySelectorAll('.close_menu'));

            this.eventtype = mobilecheck() ? 'touchstart' : 'click';

            this._initEvents();
        },
        _initEvents : function() {
            var self = this;

            // the menu should close if clicking somewhere on the body
            var bodyClickFn = function( el ) {
                self._resetMenu();
                el.removeEventListener( self.eventtype, bodyClickFn );
            };

            // open (or close) the menu
            this.trigger.addEventListener( this.eventtype, function( ev ) {
                ev.stopPropagation();
                ev.preventDefault();
                if( self.open ) {
                    self._resetMenu();
                }
                else {
                    self._openMenu();
                    // the menu should close if clicking somewhere on the body (excluding clicks on the menu)
                    document.addEventListener( self.eventtype, function( ev ) {
                        if( self.open && !hasParent( ev.target, self.el.id ) ) {
                            bodyClickFn( this );
                        }
                    } );
                }
            } );

            // opening a sub level menu
            this.menuItems.forEach( function( el, i ) {
                // check if it has a sub level
                var subLevel = el.querySelector( '.menu' );
                if( subLevel ) {
                    el.querySelector( 'div' ).addEventListener( self.eventtype, function( ev ) {
                        ev.preventDefault();
                        var level = closest( el, 'menu' ).getAttribute( 'data-level' );
                        if( self.level <= level ) {
                            ev.stopPropagation();
                            classie.add( closest(el, 'menu_item'), 'active');
                            classie.add( closest( el, 'menu' ), 'level_overlay' );
                            self._openMenu( subLevel );
                        }
                    } );
                }
            } );

            // closing the sub levels :
            // by clicking on the visible part of the level element
            this.levels.forEach( function( el, i ) {
                el.addEventListener( self.eventtype, function( ev ) {
                    ev.stopPropagation();
                    var level = el.getAttribute( 'data-level' );
                    if( self.level > level ) {
                        self.level = level;
                        self._closeMenu();
                    }
                } );
            } );

            this.menuClose.forEach(function( el, idx) {
                el.addEventListener(self.eventtype, function(event) {
                    event.preventDefault();
                    var level = closest( el, 'menu' ).getAttribute( 'data-level' );
                    if( self.level <= level ) {
                        event.stopPropagation();
                        self.level = closest( el, 'menu' ).getAttribute( 'data-level' ) - 1;
                        self.level === 0 ? self._resetMenu() : self._closeMenu();
                    }
                })
            })
        },
        _openMenu : function( subLevel ) {
            // increment level depth
            ++this.level;

            this._setTransform( 'translate3d(0,0,0)' );


            if( subLevel ) {
                // reset transform for sublevel
                this._setTransform( '', subLevel );
                // need to reset the translate value for the level menus that have the same level depth and are not open
                for( var i = 0, len = this.levels.length; i < len; ++i ) {
                    var levelEl = this.levels[i];
                        if(classie.has(levelEl, 'level_3')) {
                            console.log(levelEl)
                        } else if( levelEl != subLevel && !classie.has( levelEl, 'level_open' ) ) {
                            this._setTransform( 'translate3d(100%,0,0)', levelEl );
                        }
                }
            }
            // add class mp-pushed to main wrapper if opening the first time
            if( this.level === 1 ) {
                classie.add(this.trigger, 'is_active');
                this.open = true;
            }

            if( this.level === 3) {
               if(subLevel.getAttribute('data-collapsed') === true) {
                   this._collapseSection(subLevel)
               } else {
                   this._expandSection(subLevel)
               }
            }

            // add class mp-level-open to the opening level element
            classie.add( subLevel || this.levels[0], 'level_open' );
        },
        // This is the important part!

        _collapseSection: function(element) {
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.dataset.height;

        // temporarily disable all css transitions
        var elementTransition = element.style.transition;
        element.style.transition = '';

        // on the next frame (as soon as the previous style change has taken effect),
        // explicitly set the element's height to its current pixel height, so we
        // aren't transitioning out of 'auto'
        requestAnimationFrame(function() {
            element.style.height = sectionHeight + 'px';
            element.style.transition = elementTransition;

            // on the next frame (as soon as the previous style change has taken effect),
            // have the element transition to height: 0
            requestAnimationFrame(function() {
                element.style.height = 0 + 'px';
            });
        });

        // mark the section as "currently collapsed"
        element.setAttribute('data-collapsed', 'true');
    },
        _expandSection: function(element) {
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.scrollHeight;

        // have the element transition to the height of its inner content
        element.style.height = sectionHeight + 'px';

        // when the next css transition finishes (which should be the one we just triggered)
        element.addEventListener('transitionend', function eventListener(e) {
            // remove this event listener so it only gets triggered once
            element.removeEventListener('transitionend', eventListener);

            // remove "height" from the element's inline styles, so it can return to its initial value
            element.style.minHeight = '0px';
        });

        // mark the section as "currently not collapsed"
        element.setAttribute('data-collapsed', 'false');
    },

        // close the menu
        _resetMenu : function() {
            this._setTransform('translate3d(-100%,0,0)');
            this.level = 0;

            classie.remove(this.trigger, 'is_active');
            this._toggleLevels();
            this.open = false;
        },
        // close sub menus
        _closeMenu : function() {
            // this._setTransform( 'translate3d(100%,0,0)' );
            this._toggleLevels();
        },
        // translate the el
        _setTransform : function( val, el ) {
            el = el || this.el;
            el.style.WebkitTransform = val;
            el.style.MozTransform = val;
            el.style.transform = val;
        },
        // removes classes mp-level-open from closing levels
        _toggleLevels : function() {
            for( var i = 0, len = this.levels.length; i < len; ++i ) {
                var levelEl = this.levels[i];

                if(classie.has(levelEl, 'collapse') && levelEl.getAttribute('data-collapsed') === "false") {
                    this._collapseSection(levelEl)
                }

                if( levelEl.getAttribute( 'data-level' ) >= this.level + 1 ) {
                    classie.remove( closest(levelEl, 'menu_item'), 'active');
                    classie.remove( levelEl, 'level_open' );
                    classie.remove( levelEl, 'level_overlay' );
                }
                else if( Number( levelEl.getAttribute( 'data-level' ) ) == this.level ) {
                    classie.remove( levelEl, 'level_overlay' );
                }
            }
        }
    }

    // add to global namespace
    window.MenuApp = MenuApp;

} )( window );
