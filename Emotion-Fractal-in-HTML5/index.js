var createjs;
(function (createjs) {
})(createjs || (createjs = {}));

var project;
(function (project) {
    var stage;
    var queue;
    var canvas;
    var words = 'Abandoned Abhor Ablaze Abominable Abrasive Absorbed Absurd Abused Abusive Accommodating Acknowledged Acquiescent Acrimonious Admonished Adoration Adored Adventurous Adverse Affected Affectionate Afflicted Affronted Afraid Aggravated Aggressive Agitated Agonized Agony Agreeable Airy Awkward Alienated Alive Alluring Alone Altruistic Ambiguous Ambitious Amenable Amorous Amused Anger Angry Anguished Animated Annoyed Anxiety Anxious Apathy Appealing Appeasing Appetizing Appreciation Apprehensive Ardent Arduous Argumentative  Armored Aroused Arrogant Astounded Attentive Avoidance Bemused Betrayed Bewildered Bewitched Bitchy Bitter Blah Blessed Blissful Blunt Boiling Bored Bothered Brave Breathless Breezy Bright Broken Bruised Buoyant Burdensome Bursting Callous Calm Captivated Captivating Careless Caring Celebrating Chagrined Charmed Charming Chastened Cheerful Cherishing Clandestine Clear Cold Collected Comatose Comfortable Compassion Competitive Complacent Composed Concerned Confused Congenial Content Cool Copasetic Coping Cordial Cornered Creative Crucified Crushed Cursed Cushy Cut down Dainty Defensive Dejected Delectable Delicate Delighted Demure Depressed Desirable Desired Desolate Despair Despondent Devoted Devoured Discomfort Discontented Disgust Dismal Dispassionate Displeased Disregard Disregarding Distracted Distressed Disturbed Doldrums Doomed Droopy Dull Eager Earnest Easy Ecstatic Electric Enchanted Endearing  Enduring Engaging Enjoy Enlivened Enraged Enraptured Enthused Enthusiastic Enticing Even tempered Exacerbated Exasperated Excited Exciting Exultation Fanatical Fascinated Fascinating Fear Fearful Fearing Fervent Fervor Fiery Flared up Flattering Flushed Flustered Fluttery Frantic Fretful Frigid Frisky Frustration Full Fuming Fun Funny Furious Galvanized Gay Genial Giggly Glad Glee Gleeful Gloom Gloomy Glowing Gnawing Good Goodness Grateful Gratified Gratitude Grave Grief Grieving Grim Griped Grounded Gushing Gusto Haggard Halfhearted Hardened Harsh Having Fun Hearty Heavy Hectic Hilarious Hopeful Hopeful Horrified Humorous Hurt Hysterical Impetuous Imposing Impressed Impressionable Impulsive Inattentive Indulged Indulgent Inept Infelicitous Inflexible Infuriated Insatiable Insensitive Insouciant Inspired Interested Intimidated Intrigued Inviting Irrepressible Irritated Irritation Jaunty Jealous Jittery Jolly Jovial Joy Joyful Jubilation Languid Languish Laugh Laughingly Lethargic Light hearted Lively Loathe Lonely Lonesome Lost Love Loved Loving Lukewarm Luxurious Mad Manic Martyr Meddlesome Melancholy Melodramatic Merry Mindful Mindless Mirthful Miserable Moderate Mopy Mortified Moved Nervous Nonchalant Not caring Numb Optimistic Overflowing Pain Panic Paralyzed Passionate Passive Patient Perky Perplexed Perturbation Perturbed Petrified Pine Piquant Pitied Placid Plagued Pleasant Pleasing Pleasurable Pleasured Pressured Protected Proud Provocative Provoked Quarrelsome Quenched Quiet Quivering Quivery Radiant Rash Raving Ravished Ravishing Ready to burst Receptive Reckless Reconciled Refreshed Rejected Rejection Rejoice Relish Repressed Repugnant Resentful Resentment Resigned Resistant Restrained Restraint Revived Ridiculous Romantic Rueful Safe Satiated Satisfaction Satisfied Scared Secretive Secure Sedate Seduced Seductive Seething Selfish Sensational Sensual Sentimental Serious Shaken Shielded Shocked Shutter Shy Silly Simmering Sincere Sinking Smug Snug Sober Sobering Soft Solemn Somber Sore Sorrow Sorrowful Sour Sparkling Spastic Spicy Spirited Spry Stoic Stranded Stressed Stricken Stung Stunned Subdued Subjugated Suffering Sunny Supportive Surrender Susceptible Suspended Sweet Sympathy Tame Tantalizing Tantrumy Temperate Tender Threatened Thrilled Tickled Tight Timid Tingly Tolerant Tormented Tortured Touched Tranquil Transported Trepidation Troubled Twitchy Uncomfortable Unconcerned Unconscious Uncontrollable Under pressure Undone Unfeeling Unhappy Unimpressed Unruffled Used Vexed Victim Victimized Vivacious Volcanic Voluptuous Vulnerable Warm Warmhearted Weary Welcomed Whining Winsome Wistful Woe Woeful Worked up Worried Wounded Wretched Yearn Yearning Yielding Zeal Zealous'.split(' ');
    var poolParticle = [];
    var isWaiting = false;
    var fonts = ["Habibi", 'Freckle Face', 'Archivo Black', 'Krona One'];
    var colors = ["#F00", "#900", "#336699", "#000", "#090"];
    var indexNumber = fonts.length * Math.random() >> 0;
    var currentColor = colors[(colors.length * Math.random()) >> 0];

    function init() {
        var queue = new createjs.LoadQueue();
        queue.useXHR = false;
        queue.addEventListener("complete", initContent);
        queue.addEventListener("fileload", handleFileLoad);
        queue.loadManifest({ src: 'http://fonts.googleapis.com/css?family=Habibi|Freckle+Face|Archivo+Black|Krona+One', type: "css" }, false);
        queue.load();
    }
    project.init = init;
    function handleFileLoad(event) {
        if (event.item.type == "css") {
            (document.getElementsByTagName("head")[0]).appendChild(event.item.tag);
        }
    }

    function initContent() {
        canvas = document.getElementById("myCanvas");
        stage = new createjs.Stage(canvas);
        queue = [new createjs.Rectangle(0, 0, canvas.width, canvas.height)];

        createjs.Ticker.setFPS(60);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.addEventListener("tick", handleTick);
    }

    function handleTick() {
        var i = 0;
        while (queue.length > 0 && i < 4) {
            var rect = queue.pop();
            if (rect.width > 4 && rect.height > 4) {
                fillRegion(rect);
                i++;
            }
        }
        if (!queue.length) {
            if (isWaiting == false) {
                setTimeout(function () {
                    queue = [new createjs.Rectangle(0, 0, canvas.width, canvas.height)];
                    for (var i = 0; i < stage.getNumChildren(); i++) {
                        var tf = stage.getChildAt(i);
                        toPool(tf);
                    }
                    stage.removeAllChildren();
                    isWaiting = false;
                    indexNumber++;
                    if (indexNumber >= fonts.length)
                        indexNumber = 0;
                    currentColor = colors[colors.length * Math.random() >> 0];
                }, 1500);
            }
            isWaiting = true;
        }

        stage.update();
    }

    function fillRegion(region) {
        var tf = fromPool();
        tf.text = choice(words).toUpperCase();
        tf.font = "72px " + fonts[indexNumber];
        tf.color = currentColor;
        tf.textAlign = "start";
        tf.textBaseline = "bottom";

        var bound = new createjs.Rectangle(0, 0, tf.getMeasuredWidth(), tf.getMeasuredHeight());
        stage.addChild(tf);

        var s = region.width / bound.width * (Math.random() * 0.4 + 0.3);
        if (bound.height * s > region.height)
            s = region.height / bound.height;
        tf.scaleX = s;
        tf.scaleY = s;
        bound.x *= s;
        bound.y *= s;
        bound.width *= s;
        bound.height *= s;

        switch (choice([1, 2, 3, 4])) {
            case 1:
                tf.x = region.x - bound.x;
                tf.y = region.y - bound.y;
                queue.push(new createjs.Rectangle(region.x + bound.width, region.y, region.width - bound.width, bound.height), new createjs.Rectangle(region.x, region.y + bound.height, region.width, region.height - bound.height));
                break;
            case 2:
                tf.x = region.x - bound.x;
                tf.y = (region.y + region.height) - (bound.y + bound.height);
                queue.push(new createjs.Rectangle(region.x + bound.width, (region.y + region.height) - bound.height, region.width - bound.width, bound.height), new createjs.Rectangle(region.x, region.y, region.width, region.height - bound.height));
                break;
            case 3:
                tf.x = (region.x + region.width) - (bound.x + bound.width);
                tf.y = region.y - bound.y;
                queue.push(new createjs.Rectangle(region.x, region.y, region.width - bound.width, bound.height), new createjs.Rectangle(region.x, region.y + bound.height, region.width, region.height - bound.height));
                break;
            case 4:
                tf.x = (region.x + region.width) - (bound.x + bound.width);
                tf.y = (region.y + region.height) - (bound.y + bound.height);
                queue.push(new createjs.Rectangle(region.x, (region.y + region.height) - bound.height, region.width - bound.width, bound.height), new createjs.Rectangle(region.x, region.y, region.width, region.height - bound.height));
                break;
        }

        tf.y += bound.height;
        tf.alpha = 0;

        createjs.Tween.get(tf).to({ alpha: 1 }, 1000, createjs.Ease.cubicOut);
    }

    function choice(ary) {
        return ary[Math.floor(ary.length * Math.random())];
    }

    function fromPool() {
        if (poolParticle.length)
            return poolParticle.pop(); else
            return new createjs.Text();
    }

    function toPool(text) {
        poolParticle.push(text);
    }
})(project || (project = {}));

window.onload = project.init;
//@ sourceMappingURL=main.js.map
