//Enum class for v3dheadertypes


    export let v3dheadertypes_canvasWidth=1;
    // UINT  Canvas width

    export let v3dheadertypes_canvasHeight=2;
    // UINT  Canvas height

    export let v3dheadertypes_absolute=3;
    // BOOL  true: absolute size; false: scale to canvas

    export let v3dheadertypes_minBound=4;
    // TRIPLE  Scene minimum bounding box corners

    export let v3dheadertypes_maxBound=5;
    // TRIPLE  Scene maximum bounding box corners

    export let v3dheadertypes_orthographic=6;
    // BOOL  true: orthographic; false: perspective

    export let v3dheadertypes_angleOfView=7;
    // REAL  Field of view angle

    export let v3dheadertypes_initialZoom=8;
    // REAL  Initial zoom

    export let v3dheadertypes_viewportShift=9;
    // PAIR  Viewport shift (for perspective projection)

    export let v3dheadertypes_viewportMargin=10;
    // PAIR  Margin around viewport

    export let v3dheadertypes_light=11;
    // RGB  Direction and color of each point light source

    export let v3dheadertypes_background=12;
    // RGBA  Background color

    export let v3dheadertypes_zoomFactor=13;
    // REAL  Zoom base factor

    export let v3dheadertypes_zoomPinchFactor=14;
    // REAL  Zoom pinch factor

    export let v3dheadertypes_zoomPinchCap=15;
    // REAL  Zoom pinch limit

    export let v3dheadertypes_zoomStep=16;
    // REAL  Zoom power step

    export let v3dheadertypes_shiftHoldDistance=17;
    // REAL  Shift-mode maximum hold distance (pixels)

    export let v3dheadertypes_shiftWaitTime=18;
    // REAL  Shift-mode hold time (milliseconds)

    export let v3dheadertypes_vibrateTime=19;
    // REAL  Shift-mode vibrate time (milliseconds)
