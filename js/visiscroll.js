VisiScroll = function(htmlContent){

    this.hookEvent = function(element, eventName, callback){
        if (typeof(element) == "string") 
            element = document.getElementById(element);
        if (element == null) 
            return;
        if (element.addEventListener) {
            if (eventName == 'mousewheel') 
                element.addEventListener('DOMMouseScroll', callback, false);
            element.addEventListener(eventName, callback, false);
        }
        else 
            if (element.attachEvent) 
                element.attachEvent("on" + eventName, callback);
    };
    
    this.cancelEvent = function(e){
        e = e ? e : window.event;
        if (e.stopPropagation) 
            e.stopPropagation();
        if (e.preventDefault) 
            e.preventDefault();
        e.cancelBubble = true;
        e.cancel = true;
        e.returnValue = false;
        return false;
    };
	
	var self = this;
	
	this.mouseWheelCallback = function(e){
		
		var normal = e.detail ? e.detail * -1 : e.wheelDelta / 40;
		self.sliderClicked = true;
		
		var newPos = self.slidingWindow.y + normal * -1;
        self.positionSlider(newPos);
		self.slidingWindow.lastSetPosition = newPos;
		
		self.sliderClicked = false;
		self.cancelEvent(e);
	};
	
	this.hookEvent(htmlContent, 'mousewheel', this.mouseWheelCallback);
    
    SlidingWindow = function(slider){
        var self = this;
        this.y = 0;
        this.height = (contentHeight / $(htmlContent).height()) * contentHeight;
        this.lastSetPosition = 0;
        
        this.redraw = function(scroll){
        
            var lingrad = slider.canvasContext.createLinearGradient(0, 0, slider.canvas.width, 0);
            lingrad.addColorStop(0, 'rgba(204, 204, 204, 0.65)');
            lingrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
            lingrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
            lingrad.addColorStop(1.0, 'rgba(136, 136, 136, 0.65)');
            
            slider.canvasContext.fillStyle = lingrad;
            slider.canvasContext.fillRect(0, self.y, slider.canvas.width, self.height);
            
            slider.canvasContext.beginPath();
            slider.canvasContext.rect(0, self.y, slider.canvas.width, self.height);
            slider.canvasContext.strokeStyle = '#888';
            slider.canvasContext.stroke();
            
            if (scroll) {
                $(htmlContent).css('marginTop', -this.y * ($(htmlContent).height() / $(parent).height()));
            }
        }
        
        this.redraw(false);
    };
    
    this.mouseClickedInSlider = function(y){
        return y > self.slidingWindow.y && y < (self.slidingWindow.y + self.slidingWindow.height);
    };
    
    var container = document.createElement("div");
    var parent = htmlContent.parentNode;
    parent.replaceChild(container, htmlContent);
    container.appendChild(htmlContent);
    
    var sliderWidth = 25;
    
    var oldContentWidth = $(htmlContent).width();
    $(htmlContent).width(oldContentWidth - sliderWidth);
    $(htmlContent).css('float', 'left');
    
    $(container).height($(parent).height());
    $(container).css('overflow', 'hidden');
    
    var contentHeight = $(parent).height();
    
    this.canvas = document.createElement("canvas");
    
    this.positionSlider = function(newPos){
        if (self.sliderClicked) {
        
            if (newPos < 0) 
                self.slidingWindow.y = 0;
            else 
                if (newPos + self.slidingWindow.height > self.canvas.height) 
                    self.slidingWindow.y = self.canvas.height - self.slidingWindow.height;
                else 
                    self.slidingWindow.y = newPos;
            
            self.redraw();
            self.renderMarginMarks();
            self.slidingWindow.redraw(true);
        }
    };
    
    $(this.canvas).mousedown(function(e){
        var clickPosY = e.pageY - this.offsetTop;
        
        self.sliderClicked = true;
        
        if (self.mouseClickedInSlider(clickPosY)) {
            self.slidingWindow.lastClickedPos = clickPosY;
        }
        else {
            self.positionSlider(clickPosY - 10);
        }
    });
    
    $("body").mousemove(function(e){
        var posY = e.pageY - self.canvas.offsetTop;
        var newPos = self.slidingWindow.lastSetPosition + posY - self.slidingWindow.lastClickedPos;
        self.positionSlider(newPos);
    });
    
    $("body").mouseup(function(e){
        self.sliderClicked = false;
        self.slidingWindow.lastSetPosition = self.slidingWindow.y;
    });
    
    var width = sliderWidth + "px";
    var height = contentHeight + "px";
    
    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);
    $(this.canvas).css('float', 'left');
    
    container.appendChild(this.canvas);
    
    this.redraw = function(){
        self.canvasContext = this.canvas.getContext("2d");
        self.canvasContext.font = "bold 18px sans-serif";
        self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);
        
        var lingrad = self.canvasContext.createLinearGradient(0, 0, self.canvas.width, 0);
        lingrad.addColorStop(0, '#777');
        lingrad.addColorStop(0.5, '#fff');
        lingrad.addColorStop(0.5, '#fff');
        lingrad.addColorStop(1.0, '#fff');
        
        self.canvasContext.fillStyle = lingrad;
        self.canvasContext.fillRect(0, 0, self.canvas.width, self.canvas.height);
    };
    
    this.renderMarginMarks = function(recalculateMarkers){
        var sliderMarkerElements = $(htmlContent).find('[visiScrollMarker]');
        
        if (recalculateMarkers || !this.markers) {
            this.markers = sliderMarkerElements.map(function(){
            
                var top = this.offsetTop - $(this).parent().position().top;
                top = top < 0 ? this.offsetTop : top;
                
                return {
                    top: top,
                    colour: this.attributes.visiScrollMarker.nodeValue,
                    height: $(this).height() * (self.canvas.height / $(htmlContent).height())
                };
            });
        }
        
        $.each(this.markers, function(idx, marker){
            var lingrad = self.canvasContext.createLinearGradient(0, 0, self.canvas.width, 0);
            lingrad.addColorStop(0, '#777');
            lingrad.addColorStop(0.5, marker.colour);
            lingrad.addColorStop(0.5, marker.colour);
            lingrad.addColorStop(1.0, '#fff');
            
            self.canvasContext.fillStyle = lingrad;
            var tTop = (self.canvas.height / $(htmlContent).height()) * marker.top;
            self.canvasContext.fillRect(1, tTop, self.canvas.width - 1, marker.height < 2 ? 2 : marker.height);
        });
    }
    
    this.redraw();
    this.renderMarginMarks();
    this.slidingWindow = new SlidingWindow(this);
}
