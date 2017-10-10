// WORLD
function World(x, y) {
    this.width = x;
    this.height = y;
    this.space = createArray(x, y);
    this.initialize();
}

World.prototype.slide = function () {
    for (var i = 0; i < this.width - 1; i++) {
        for (var j = 0; j < this.height; j++) {
            this.space[i][j] = this.space[i + 1][j];
        }
    }

    var amountOfNewObstacles = 0;

    for (var i = 0; i < this.height; i++)
    {
        if (worldtime % (obstacleXDistance + 1) === 0) {
            if ((Math.random() * 100) < difficultyAmount) {

                this.space[this.width - 1][i] = 1;
                amountOfNewObstacles++;

                if (amountOfNewObstacles >= this.height) {

                    for (var i = 0; i < this.height; i++) {
                        this.space[this.width - 1][i] = 0;
                    }
                }
            } else {
                this.space[this.width - 1][i] = 0;
            }
        } else {
            this.space[this.width - 1][i] = 0;
        }
        
    }
    
    
};

World.prototype.initialize = function () {
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            if (this.space[i][j] === undefined) {
                this.space[i][j] = 0;
            }
        }
    }
};

function getWorldSeed() {
    Math.seedrandom(user_seed);
}

function prepareCanvas(val) {
    canvas[val] = document.getElementById("canvas" + val);
    ctx[val] = canvas[val].getContext('2d');
    ctx[val].scale(10, 10);
}



// ORIGINAL SHIP
function ShipOriginal(x, y) {
    this.position = 4;
    this.state = 1;
    this.behaviour = createArray(x, y, 2);
}




// SHIP CHILDREN
function ShipChild(id, behaviour) {
    this.id = id;
    
    this.position = 1;
    this.target = 0;
    this.decision = [];
    
    this.state = 1;
    this.lifetime = 0;
    
    this.behaviour = behaviour;
    this.mutate();
}

ShipChild.prototype.act = function () {
    if (this.state == 1)
    {
        this.lifetime++; // Age, the higher the fitter 
        
        if (perception_mode === "absolute")
        {
            for (var i = 0; i < world.height; i++)
            {
                this.decision[i] = 0;
            }
            
            for (var i = 0; i < world.width; i++)
            {
                for (var j = 0; j < world.height; j++)
                {
                    if (world.space[i][j] == 0)
                    {
                        this.decision[j] = this.decision[j] + this.behaviour[i][j][0];
                    } else if (world.space[i][j] == 1)
                    {
                        this.decision[j] = this.decision[j] + this.behaviour[i][j][1];
                    }
                }
            }
            
            this.target = 0;
            var highestValue = this.target;
            for (var i = 0; i < world.height; i++)
            {
                if (this.decision[i] > highestValue)
                {
                    this.target = i;
                    highestValue = this.decision[i];
                }
            }
            if (this.position > this.target && this.position > 0)
            {
                this.position -= 1;
            } else if (this.position < this.target && this.position < world.height - 1)
            {
                this.position += 1;
            }
            
            if (world.space[1][this.position] == 1)
            {
                this.state = 0;
                contestants_alive -= 1;
            }
        } else if (perception_mode === "relative")
        {
            for (var i = 0 - (world.height - 1); i < world.height; i++)
            {
                this.decision[i] = 0;
            }
            
            for (var i = 0; i < this.behaviour.length; i++)
            {
                for (var j = 0 - (world.height - 1); j < world.height; j++)
                {
                    if (this.position + j < world.height - 1 && this.position + j >= 0)
                    {
                        var current_field = world.space[i][this.position + j];
                        if (current_field == 0)
                        {
                            this.decision[j] = this.decision[j] + this.behaviour[i][j + (world.height - 1)][0];
                        } else if (current_field == 1)
                        {
                            this.decision[j] = this.decision[j] + this.behaviour[i][j + (world.height - 1)][1];
                        }
                    }
                }
            }
            
            this.target = 0;
            var highestValue = this.decision[0];
            
            for (var i = 0 - (world.height - 1); i < world.height; i++)
            {
                if (this.position + i < world.height && this.position + i >= 0)
                {
                    if (this.decision[i] > highestValue)
                    {
                        this.target = i;
                        highestValue = this.decision[i];
                    }
                }
            }
            
            if (this.target > 0)
            {
                this.position += 1;
            } else if (this.target < 0)
            {
                this.position -= 1;
            }
            
            if (world.space[1][this.position] == 1)
            {
                this.state = 0;
                contestants_alive -= 1;
            }
        }
    }
};

ShipChild.prototype.mutate = function () {
    Math.seedrandom();
    for (var i = 0; i < this.behaviour.length; i++)
    {
        for (var j = 0; j < this.behaviour[i].length; j++)
        {
            for (var k = 0; k < this.behaviour[i][j].length; k++)
            {
                this.behaviour[i][j][k] = MutateValue(this.behaviour[i][j][k]);
            }
        }
    }
};

function MutateValue(val) {
    if (val === undefined)
    {
        val = 0;
    }
    
    if (Math.random() < mutation_probability)
    {
        val += (weightedRandom(200, 4) - 1);
    }
    return val;
    
    if (val < -20)
    {
        val = -20;
    }
    
    if (val > 20)
    {
        val = 20;
    }
}




// GAME FUNCTIONS
function draw() {
    world.slide();
    for (var i = 0; i < contestants; i++)
    {
        ships[i].act();
    }
    
    if ($('#user_drawships').prop("checked") === true)
    {
        for (var i = 0; i < contestants; i++)
        {
            if (ships[i].state == 1)
            {
                ctx[i].clearRect(0, 0, world.width, world.height);
                ctx[i].beginPath();
                ctx[i].rect(1, ships[i].position, 1, 1);
                ctx[i].fillStyle = "#0095DD";
                ctx[i].fill();
                ctx[i].closePath();
                
                for (var j = 0; j < world.width; j++)
                {
                    for (var k = 0; k < world.height; k++)
                    {
                        if (world.space[j][k] === 1)
                        {
                            ctx[i].beginPath();
                            ctx[i].rect(j, k, 1, 1);
                            ctx[i].fillStyle = "#FF1111";
                            ctx[i].fill();
                            ctx[i].closePath();
                        } else
                        {
                            
                        }
                        
                    }
                }
            }
            // On death, move canvas to bottom of contestants. Optional.
            else if (remove_on_death === 'true')
            {
                $('#canvas' + i).appendTo('#content');
            }
        }
    }
    
    
    if (contestants_alive < 1)
    {
        Math.seedrandom();
        reset();
        getWorldSeed();
    }
    worldtime++;
}

function reset() {
    stop();
    worldtime = 0;
    
    $('canvas').remove();
    $('#content').append(canvas_html);
    
    world = new World(width, height);
    
    // Determine the best 33%
    winner_ids = createArray(contestants, 2);
    for (var i = 0; i < contestants; i++)
    {
        winner_ids[i][0] = ships[i].id;
        winner_ids[i][1] = ships[i].lifetime;
    }
    
    winner_ids = winner_ids.sort(function (a, b) {
        return b[1] - a[1];
    });
    
    // Decides color of generation history
    winner_lifetime = winner_ids[0][1];
    if (winner_lifetime > winner_lifetime_old)
    {
        lifetime_color = 'green';
    } else if (winner_lifetime < winner_lifetime_old)
    {
        lifetime_color = 'red';
    } else
    {
        lifetime_color = 'black';
    }
    winner_lifetime_old = winner_lifetime;
    
    $('#lifetimes').prepend($('<option style="color:' + lifetime_color + '"></option>').html(generation + " - " + winner_lifetime));
    
    contestants_alive = contestants;
    mutation_probability = ($('#user_mutation').val() / 100);
    difficultyAmount = parseFloat($('#user_diffAmount').val());
    obstacleXDistance = parseInt($('#user_obstacle_distance').val());
    speed = parseInt($('#user_speed').val());
    remove_on_death = $('#user_rmOnDeath option:selected').val();
    user_seed = parseInt($('#user_seed').val());
    user_nextlevel = parseInt($('#user_nextlevel').val());
    if ($('#user_autolevel').prop("checked") === true)
    {
        if (levelprogression >= user_nextlevel)
        {
            user_seed = user_seed + 1;
            $('#user_seed').val(user_seed);
            levelprogression = 0;
        } else
        {
            levelprogression++;
        }
    }
    
    winner_genes = [];
    for (var i = 0; i < Math.round(contestants / 5); i++)
    {
        winner_genes[i] = ships[winner_ids[i][0]].behaviour;
    }
    
    showWinnerGenes();
    
    parent = 0;
    for (i = 0; i < contestants; i++)
    {
        ships[i] = new ShipChild(i, createArray(width, ((height * 2) - 1), 2));
        for (var j = 0; j < world.width; j++)
        {
            for (var k = 0; k < (world.height * 2) - 1; k++)
            {
                for (var l = 0; l < 2; l++)
                {
                    ships[i].behaviour[j][k][l] += winner_genes[parent][j][k][l];
                }
                
            }
        }
        prepareCanvas(i);
        parent += 1;
        if (parent >= Math.round(contestants / 5))
        {
            parent = 0;
        }
    }
    
    generation++;
    $('#generation').text('Generation ' + generation);
    
    
    $(function () {
        var limit = 10000;    //increase number of dataPoints by increasing the limit
        var data = [];
        
        dataPoints.push({
            x: generation,
            y: winner_lifetime
        });
        
        dataSeries.dataPoints = dataPoints;
        data.push(dataSeries);
        
        //Better to construct options first and then pass it as a parameter
        var options = {
            zoomEnabled: true,
            animationEnabled: false,
            title: {
                text: "History of Runs"
            },
            axisX: {
                labelAngle: 30
            },
            axisY: {
                includeZero: false
            },
            data: data
        };
        
        $("#chartContainer").CanvasJSChart(options);
        
    });
    
    
    
    start(speed);
}

function start(speed) {
    game = setInterval(draw, speed);
}

function stop() {
    clearInterval(game);
}

function showWinnerGenes() {
    
    winner_canvas_html = "";
    
    winner_canvas_html += '<canvas id="winner_canvas" width="' + world.width * 10 + '" height="' + ((world.height * 2) - 1) * 10 + '"></canvas>';
    
    $('#winner_canvas').remove();
    $('.last_winner').append(winner_canvas_html);
    
    winner_canvas = document.getElementById("winner_canvas");
    winner_ctx = winner_canvas.getContext('2d');
    winner_ctx.scale(10, 10);
    
    for (var j = 0; j < world.width; j++)
    {
        for (var k = 0; k < (world.height * 2) - 1; k++)
        {
            var a = 125 + (6 * (Math.round(winner_genes[0][j][k][0])).toString(16));
            var b = 125 + (6 * (Math.round(winner_genes[0][j][k][1])).toString(16));
            winner_ctx.beginPath();
            winner_ctx.rect(j, k, 1, 1);
            winner_ctx.fillStyle = "rgba(" + a + ", " + b + ", 255, 1)";
            winner_ctx.fill();
            winner_ctx.closePath();
        }
    }
}




// CLICK/EVENT FUNCTIONS
$('#run').click(function () {
    width = parseInt($('#user_width').val());
    height = parseInt($('#user_height').val());
    contestants = parseInt($('#user_contestants').val());
    mutation_probability = ($('#user_mutation').val() / 100);
    difficultyAmount = parseFloat($('#user_diffAmount').val());
    obstacleXDistance = parseInt($('#user_obstacle_distance').val());
    speed = parseInt($('#user_speed').val());
    perception_mode = $('#perception_mode option:selected').val();
    remove_on_death = $('#user_rmOnDeath option:selected').val();
    user_seed = $('#user_seed').val();
    user_nextlevel = parseInt($('#user_nextlevel').val());
    levelprogression = 0;
    
    $('#user_width').prop('disabled', true);
    $('#user_height').prop('disabled', true);
    $('#user_contestants').prop('disabled', true);
    $('#run').prop('disabled', true);
    $('#perception_mode').prop('disabled', true);
    
    dataSeries = {type: "line"};
    dataPoints = [];
    
    contestants_alive = contestants;
    generation = 1;
    worldtime = 0;
    winner_lifetime = 0;
    winner_lifetime_old = 0;
    
    world = new World(width, height);
    
    ships = {}; // main object
    canvas_html = "";
    canvas = [];
    ctx = [];
    
    for (var i = 0; i < contestants; i++)
    {
        canvas_html += '<canvas id="canvas' + i + '" width="' + world.width * 10 + '" height="' + world.height * 10 + '"></canvas>';
    }
    $('canvas').remove();
    $('#content').append(canvas_html);
    
    for (i = 0; i < contestants; i++)
    {
        ships[i] = new ShipChild(i, createArray(width, ((height * 2) - 1), 2));
        prepareCanvas(i);
    }
    
    getWorldSeed();
    start(speed);
});

$('#pause').click(function () {
    stop();
});

$('#play').click(function () {
    start(speed);
});




// OTHER FUNCTIONS
function weightedRandom(max, bellFactor) {
    // This function generates a random number between 0 and max/100, bellFactor
    var num = 0;
    for (var i = 0; i < bellFactor; i++)
    {
        num += Math.random() * (max / bellFactor);
    }
    return (num / 100);
}

function createArray(length) {
    var arr = new Array(length || 0), i = length;
    
    if (arguments.length > 1)
    {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--)
            arr[length - 1 - i] = createArray.apply(this, args);
    }
    return arr;
}

