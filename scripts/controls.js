"use strict";

/**
 * Module used for binding HTML inputs with the Javascript objects of
 * the simulation.
 */
var Controls = (function(){
  /* Private static attributes */

  /* Private static methods */
  function bindInput(element, func, input) {
    element.addEventListener(input, func, false);
    func();
  }
  
  function bindRenderingSection(gl, particles, fluidify) {
    const pointSizeSlider = document.getElementById("point-size-slider");
    const updatePointSize = () => { particles.pointSize = pointSizeSlider.value; };
    bindInput(pointSizeSlider, updatePointSize, "input");
    
    const blurSlider = document.getElementById("blur-slider");
    const updateBlur = () => { fluidify.setKernelSize(gl, blurSlider.value); };
    bindInput(blurSlider, updateBlur, "input");
    
    const blurThresholdSlider = document.getElementById("blur-threshold-slider");
    const updateThreshold = () => { fluidify.threshold = blurThresholdSlider.value; };
    bindInput(blurThresholdSlider, updateThreshold, "input");
    
    const waterNormalsCheckbox = document.getElementById("water-normals-checkbox");
    const setWaterNormals = () => { fluidify.showNormals = waterNormalsCheckbox.checked; };
    bindInput(waterNormalsCheckbox, setWaterNormals, "change");
    
    const specularCheckbox = document.getElementById("specular-checkbox");
    const updateSpecular = () => { fluidify.specular = specularCheckbox.checked; };
    bindInput(specularCheckbox, updateSpecular, "change");
  }

  function bindParticlesSection(gl, particles) {
    const sizes = [{width: 16, height: 16},
                     {width: 32, height: 32},
                     {width: 64, height: 64},
                     {width: 128, height: 128},
                     {width: 256, height: 256},
                     {width: 512, height: 512},
                     {width: 512, height: 1024},
                     {width: 1024, height: 1024},
                     {width: 1024, height: 2048},
                     {width: 2048, height: 2048},];
   
    const amountSlider = document.getElementById("amount-slider");
    const updateAmount = function() {
      const size = sizes[amountSlider.value];
      particles.reset(gl, size.width, size.height);
      
      let nbParticlesText = document.getElementById("nb-particles-text");
      nbParticlesText.textContent = particles.nbParticles;
    }
    bindInput(amountSlider, updateAmount, "change");
    
    const gravitySlider = document.getElementById("gravity-slider");
    const updateGravity = () => { particles.acceleration =[0, -gravitySlider.value]; };
    bindInput(gravitySlider, updateGravity, "input");
    
    const speedSlider = document.getElementById("speed-slider");
    const updateSpeed = () => { particles.speed = speedSlider.value; };
    bindInput(speedSlider, updateSpeed, "input");
  }

  function bindObstaclesSection(gl, canvas, obstacles) {
    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => { obstacles.reset(gl), false; });
    
    const brushSizeSlider = document.getElementById("brushsize-slider");
    const updateBrushSize = function() {
      const value = brushSizeSlider.value;
      obstacles.brushSize = [value / canvas.clientWidth,
        value / canvas.clientHeight];
    }
    bindInput(brushSizeSlider, updateBrushSize, "input");
    
    const displayNormalsCheckbox = document.getElementById("display-normals-checkbox");
    const updateNormals = () => { obstacles.displayNormals = displayNormalsCheckbox.checked; };
    bindInput(displayNormalsCheckbox, updateNormals, "change");
  }

  function bindMouse(gl, canvas, obstacles) {
    let isMouseDown = false;
    canvas.onmousemove = function addObstacles(event) {
      let posX = event.offsetX / canvas.clientWidth;
      let posY = 1.0 - event.offsetY / canvas.clientHeight;
        
      obstacles.setMobileObstacle(gl, posX, posY);
      if (isMouseDown) {
        obstacles.addStaticObstacle(gl, posX, posY);
      }
    }
    canvas.onmousedown = function (event) {
      isMouseDown = true;
      canvas.onmousemove(event);
    }
    document.body.onmouseup = function () {
      isMouseDown = false;
    }
  }

  /* Public static methods */
  let visible = {
    setFluidMode: function(bool) {},

    showFluidSection(fluid) {
      const fluidSection = document.getElementById("fluid-controllers");
      
      fluidSection.className = fluidSection.className.replace(/ hidden/g, "");
      if (!fluid) {
        fluidSection.className += " hidden";
      }
    },
    
    bind: function(gl, canvas, particles, obstacles, fluidify) {
      bindRenderingSection(gl, particles, fluidify);
      bindParticlesSection(gl, particles);
      bindObstaclesSection(gl, canvas, obstacles);
      bindMouse(gl, canvas, obstacles);
      
      const particlesButton = document.getElementById("point-mode-button");
      
      const setMode = (fluid) => {
        this.showFluidSection(fluid);
        this.setFluidMode(fluid);
      };
      
      particlesButton.addEventListener("click", () => setMode(false));
      
      const fluidButton = document.getElementById("fluid-mode-button");
      fluidButton.addEventListener("click", () => setMode(true));
    },

    /**
     * For hardware that doesn't support specularity, disables
     * the specular check box.
     */
    disableSpecular: function() {
      const checkbox = document.getElementById("specular-checkbox");
      const label = document.getElementById("specular-label");
      
      checkbox.checked = false;
      checkbox.disabled = "disabled";
      label.style.color = "grey";
      label.innerHTML = "not supported";
    }
  };
  
  Object.defineProperty(visible, "bind", {writable: false});
  Object.defineProperty(visible, "disableSpecular", {writable: false});
  Object.preventExtensions(visible);
  Object.seal(visible);
  
  return visible;
  
})();