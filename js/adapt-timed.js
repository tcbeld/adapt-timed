define([
    "core/js/adapt",
    "core/js/views/componentView",
    "core/js/models/componentModel"
], function(Adapt, ComponentView, ComponentModel){

    var Timed = ComponentView.extend({
    events: {
            'click .waitButton': 'viewNext'
        },
	viewNext: function() {
		var gotoBlockID = this.model.get('_gotoBlockID');
		// Syntax: Adapt.navigateToElement(element, options);
		Adapt.navigateToElement(gotoBlockID, {duration: 500});
                
	},
        preRender: function() {
            this.$el.addClass("no-state");
            // Checks to see if the blank should be reset on revisit
            this.checkIfResetOnRevisit();
            this.listenTo(Adapt, 'device:changed', this.resizeImage);

            // Checks to see if the graphic should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        postRender: function() {
	    var waitTime = this.model.get('_waitTime');
            this.setReadyStatus();
            this.$('.component-inner').on('inview', _.bind(this.inview, this));
	    this.$('.component-inner'), this.$('#timedbutton').delay(waitTime).fadeIn(2200);
	    this.resizeImage(Adapt.device.screenSize, true);
        },
        
	// Used to check if the blank should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },
	        /**
         * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
         */
        getInviewElementSelector: function() {
            if(this.model.get('body')) return '.component-body';

            if(this.model.get('instruction')) return '.component-instruction';

            if(this.model.get('displayTitle')) return '.component-title';

            return null;
        },
        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-inner').off('inview');
                    this.setCompletionStatus();
                }
            }
        },
	            resizeImage: function(width, setupInView) {
            var imageWidth = width === 'medium' ? 'small' : width;
            var imageSrc = (this.model.get('_graphic')) ? this.model.get('_graphic')[imageWidth] : '';
            this.$('.graphic-widget img').attr('src', imageSrc);

            this.$('.graphic-widget').imageready(_.bind(function() {
                this.setReadyStatus();

                if (setupInView) {
                    // Bind 'inview' once the image is ready.
                    this.$('.component-widget').on('inview', _.bind(this.inview, this));
                }
            }, this));
        },
	    remove: function() {
            if(this.model.has('inviewElementSelector')) {
                this.$(this.model.get('inviewElementSelector')).off('inview');
            }

            ComponentView.prototype.remove.call(this);
	    },
  
        template: 'timed'

    });
    Adapt.register('timed', Timed);
    return Timed;
});
