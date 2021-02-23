#! coffeescript 

###
	HYPO-ALERGIC TANGENSOID 
###
class Tangensoid
    target:null
    vx:0
    vy:0
    a :0
    va:0
    ox:0
    oy:0
    speed: 3
    orbiting: false
    constructor: (@x, @y, @r=Math.random()*20+10, @c="#404040" )->
    
    draw:->
        p = (Math.ceil(@x)+Math.ceil(@y)*W)*4
        img.data[p+3] = 200 if 0 < p < W*H*4
        ctx.strokeStyle = "rgba(40,40,40,0.5)"
        ctx.beginPath()
        ctx.arc(@x, @y, @r, 0, Math.PI*2)
        ctx.closePath()
        ctx.stroke()
        
        if @target
            
            ctx.beginPath()
            ctx.moveTo(@x, @y)
            ctx.lineTo(@target.x, @target.y)
            ctx.strokeStyle = "rgba(0,0,0,0.1)"
            ctx.closePath()
            ctx.stroke()
            
            ctx.beginPath()
            ctx.arc(@x, @y, @r, 0, Math.PI*2)
            ctx.strokeStyle = "rgba(0,0,0,0.5)"
            ctx.closePath()
            ctx.stroke()
            
        if @orbiting
            
            ctx.beginPath()
            ctx.moveTo @x, @y
            ctx.lineTo @orbitingTarget.x, @orbitingTarget.y
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo @x, @y
            ctx.lineTo @x-@oy*30, @y+@ox*30
            ctx.strokeStyle = "rgba(255,  0 ,  0, 0.5)"
           	ctx.stroke()
            
            ctx.beginPath()
           	ctx.moveTo @x, @y
            ctx.lineTo @x+@vx*30, @y+@vy*30
            ctx.strokeStyle = "rgba(  0, 0, 255, 0.5)"
           	ctx.stroke()
            
        return
    
    getRandomTarget:->tangentosoids[Math.random()*tangensoids.length | 0]
    
    setTarget:()->
        @target = tangensoids[1+ tc++ % (tangensoids.length-1)]
        
        return
        
    move:->
        return unless @target
        if not @orbiting
            dx = @target.x - @x
            dy = @target.y - @y
            ln = Math.sqrt dx*dx + dy*dy
            a = Math.atan2(dy, dx)
            b = Math.asin((@target.r+@r)/ln)
            @vx = Math.cos(a+b) 
            @vy = Math.sin(a+b)    
            
            @x += @vx*@speed
           	@y += @vy*@speed
          
            if ln <= @target.r + @r+0.5
                @a = Math.atan2(dy, dx)+Math.PI*2
                @orbiting = true
                @orbitingTarget = @target
                @ox = @vy
                @oy =-@vx
                do @setTarget
        else
            @a -= @speed/(@orbitingTarget.r+@r);
            @ox = Math.cos(@a)
            @oy = Math.sin(@a)
            @x = @orbitingTarget.x - @ox*(@orbitingTarget.r+@r)
            @y = @orbitingTarget.y - @oy*(@orbitingTarget.r+@r)
            
            dx = @target.x - @x
            dy = @target.y - @y
            ln = Math.sqrt dx*dx + dy*dy
            a = Math.atan2(dy, dx)
            b = Math.asin((@target.r+@r)/ln)
            @vx = Math.cos(a+b) 
            @vy = Math.sin(a+b)
            if (@vx+@oy)*(@vx+@oy)+(@vy-@ox)*(@vy-@ox) < 0.01 then @orbiting = false
        
        return
    
mainloop = ->
   	ctx.putImageData img, 0, 0
    t.draw() for t in tangensoids
   	t.move() for t in tangensoids
    return

createContext = (W, H) ->
    canvas = document.createElement "canvas"
    canvas.width  = W
    canvas.height = H
    canvas.getContext "2d"
    
###
INIT
###

cvs = document.getElementById "world"
cvs.width  = W = window.innerWidth;
cvs.height = H = window.innerHeight;
r2g = 1/Math.PI*180.0;
tc = 0;

ctx = cvs.getContext "2d"    
img = ctx.createImageData W, H   
i=20
tangensoids = (new Tangensoid H/2*(1+Math.random()-Math.random()) , W/2*(1+Math.random()-Math.random()) | 0 while i--)
tangensoids[0].r = 10;
tangensoids[0].setTarget();

setInterval mainloop, 1000/30
