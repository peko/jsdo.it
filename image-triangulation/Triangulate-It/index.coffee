# Triangle metrics
TR = 1.0         # external radius
Tr = TR/2.0        # inner radius
S3 = Math.sqrt 3.0
Ta = TR*S3         # side length


window.stroke="#888"

triangles = {}

clear = ->
    console.log "clear"
    ctx.clearRect 0, 0, cvs.width, cvs.height
    
resizeTimeout = -1

resize = ->
    console.log "resize"
    @W = cvs.width  = 4096 #window.innerWidth
    @H = cvs.height = 4096 #window.innerHeight
    @ctx = cvs.getContext "2d"
    
    clear()
    if img.src is ""
        ctx.fillText "Drop an image onto the canvas", 10, 20
    else 
        ctx.drawImage img, 0, 0

onResize = ->
    clearTimeout resizeTimeout
    setTimeout resize, 500
   
@cvs = $("canvas")[0]
@img = document.createElement "img"
resize()
window.rph = new Raphael(document.getElementById('cont'), W, H); 
@bg = rph.rect(0,0,W,H)
bg.attr "fill", "rgba(0,0,0,0)"

# $(window).resize onResize

# Image for loading    
img.addEventListener "load", (->
  clear()
  ctx.drawImage img, 0, 0
), false

# To enable drag and drop
window.addEventListener "dragover", ((evt) ->
  evt.preventDefault()
), false

# Handle dropped image file - only Firefox and Google Chrome
window.addEventListener "drop", ((evt) ->
  files = evt.dataTransfer.files
  if files.length > 0
    file = files[0]
    if typeof FileReader isnt "undefined" and file.type.indexOf("image") isnt -1
      reader = new FileReader()
      
      # Note: addEventListener doesn't work in Google Chrome for this event
      reader.onload = (evt) ->
        img.src = evt.target.result

      reader.readAsDataURL file
  evt.preventDefault()
), false

# convert p{x,y} from cartesian to barycentric coordinate system
c2b = (p, a, b, c)->
    
    ac = x: a.x-c.x, y: a.y-c.y
    bc = x: b.x-c.x, y: b.y-c.y
    pc = x: p.x-c.x, y: p.y-c.y
    
    d = (bc.y*ac.x-bc.x*ac.y)
    u = (bc.y*pc.x-bc.x*pc.y)/d
    v = (ac.x*pc.y-ac.y*pc.x)/d
    w = 1 - u - v 
    
    u: u
    v: v
    w: w

# convert p{u,v} from barycentric to cartesian coordinate system
b2c = (u, v, a, b, c)->

    w = 1 - u - v
    x: a.x*u + b.x*v + c.x*w
    y: a.y*u + b.y*v + c.y*w

# recursive grabs triangles contains p{x,y}
getTriangles = (z, p, a, b, c, T=null, H=null)->
        
        z = z>>1
        # @scene.add @createLineTriangle a, b, c

        if z==0 then return T
        
        br = c2b p, a, b, c
        # console.log z, p, a, b, c

        if br.u>0 and br.v>0 and br.w>0
            
            T?={}
            H?=0b100

            T[H] = [a,b,c]
            
            ab = x: (a.x+b.x)/2, y: (a.y+b.y)/2
            bc = x: (b.x+c.x)/2, y: (b.y+c.y)/2
            ca = x: (c.x+a.x)/2, y: (c.y+a.y)/2
            
            if br.u<=1/2 and br.v<=1/2 and br.w<=1/2
                @getTriangles z, p, ab, bc, ca, T, H<<2|0b00             #00
            if br.u>1/2 then @getTriangles z, p, a, ab, ca, T, H<<2|0b01 #01
            if br.v>1/2 then @getTriangles z, p, ab, b, bc, T, H<<2|0b10 #10
            if br.w>1/2 then @getTriangles z, p, ca, bc, c, T, H<<2|0b11 #11

        return T

# grabs triangle contains p{x,y}
getTriangle = (p, a, b, c)->

        br = c2b p, a, b, c
        u = Math.floor br.u
        v = Math.floor br.v
        w = Math.floor br.w
        d = (u+v+w)%2
        inc = if not d then 1/3 else 2/3
        # console.log d, inc
        cor = b2c (u+inc), (v+inc), a, b, c
        T = if not d then [
             { x: cor.x+a.x, y: cor.y+a.y },
             { x: cor.x+b.x, y: cor.y+b.y },
             { x: cor.x+c.x, y: cor.y+c.y }]
        else [
             { x: cor.x+a.x, y: cor.y-a.y },
             { x: cor.x-b.x, y: cor.y-b.y },
             { x: cor.x-c.x, y: cor.y-c.y }]

        T.push {u:u+inc, v:v+inc, w:1-u-v-inc*2}
        T

point2color = (p)->
    console.log p, ctx
    c = ctx.getImageData(p.x, p.y, 1, 1).data
    console.log p, c
    r = c[0]
    g = c[1]
    b = c[2]
    console.log r,g,b
    return "rgba(#{r},#{g},#{b},1.0)"

makeTriangle = (a,b,c)->
    tr = rph.path("M#{a.x} #{a.y}L#{b.x} #{b.y}L#{c.x} #{c.y}L#{a.x} #{a.y}") 
    cx = (a.x+b.x+c.x)/3.0|0
    cy = (a.y+b.y+c.y)/3.0|0
    cl = point2color {x: cx, y:cy}
    tr.attr "fill", point2color x:cx, y:cy
    tr.attr "stroke", window.stroke
    tr["data"] = cx: cx, cy:cy, a:a, b:b, c:c
    tr.click (e)->
        d = @["data"]
        @.remove()
        p0 = b2c 1,     0, d.a, d.b, d.c
        p1 = b2c 1/2, 1/2, d.a, d.b, d.c
        p2 = b2c   0,   1, d.a, d.b, d.c
        p3 = b2c   0, 1/2, d.a, d.b, d.c
        p4 = b2c   0,   0, d.a, d.b, d.c
        p5 = b2c 1/2,   0, d.a, d.b, d.c
        
        makeTriangle p0, p1, p5
        makeTriangle p1, p2, p3
        makeTriangle p3, p4, p5
        makeTriangle p1, p3, p5
        
    return tr 

pointToTriangle = (x, y, l=9)->
        
        z= Math.pow(2, l)
        a = x: 0     , y: TR*z
        b = x: Ta/2*z, y:-Tr*z
        c = x:-Ta/2*z, y:-Tr*z
        
        t = getTriangle {x:x, y:y}, a, b, c

        tr = makeTriangle(t[0], t[1], t[2])
      
                            
bg.click (e)->
    #console.log e.button
    e.preventDefault();
    #return false if e.button is 2  
    console.log e
    x = e.pageX
    y = e.pageY
    
    pointToTriangle x, y

$("#saveButton").on "click", ->    
    a = @
    svgString = rph.toSVG();
    a.download = 'mySvg.svg';
    a.type = 'image/svg+xml';
    blob = new Blob([svgString], {"type": "image/svg+xml"});
    a.href = (window.URL || webkitURL).createObjectURL(blob);

alpha = 0.9

toggleAlpha = ->
   if parseFloat($("svg").css("opacity")) < 1.0
       $("svg").css("opacity", "1") 
   else $("svg").css("opacity", "0.9") 
   
toggleStroke = ->
    console.log stroke
    if window.stroke is "#888"
        window.stroke = "none"
    else window.stroke = "#888"
    $("svg path").attr "stroke", window.stroke

$("#alphaButton").on "click", toggleAlpha
$("#strokeButton").on "click", toggleStroke
    
$(window).keyup (e)->
    toggleAlpha() if e.keyCode is 65
    toggleStroke() if e.keyCode is 83

$('body').on 'contextmenu', (e)->false