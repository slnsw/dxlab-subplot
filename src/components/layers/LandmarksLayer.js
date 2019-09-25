
import {CompositeLayer} from 'deck.gl';
import {ScenegraphLayer} from '@deck.gl/mesh-layers'; 
import {registerLoaders} from '@loaders.gl/core';
import {GLTFScenegraphLoader} from '@luma.gl/addons';

// Add the loaders that handle your mesh format here
registerLoaders([ GLTFScenegraphLoader]);

    
export class LandmarksLayer extends CompositeLayer {

    models(year){
        return [
            {
                sceneURL: 'opera_house.glb',
                name: 'opera-house',
                data: {
                    position: [ 151.2149685, -33.857158999999996 ], 
                    orientation: [0, 0, 90],
                    translation: [28, 38, 0],
                    color: [125, 125, 125, 125]
                },
                useTexture: false,
                sizeScale: 1
            },
            {
                // sceneURL: 'sydneyTower.glb',
                name: 'sydney-tower',
                data: {
                    position: [151.208757, -33.8704515], 
                    orientation: [0, 180, 90]
                },
                useTexture: true,
                sizeScale: 2000
            },
            {
                sceneURL: 'sydney_bridge.glb',
                name: 'hardbour-bridge',
                data: {
                    position: [151.2106825, -33.8522605], 
                    orientation: [0, -28, 90],
                    translation: [10, 0, 0],
                    scale: [.5, 1, 1.1],
                    color: [125, 125, 125, 125]
                },
                useTexture: false,
                sizeScale: 80
            },
            {
                sceneURL: 'anzac_bridge.glb',
                name: 'anzac-bridge',
                data: {
                    position: [151.18594000000002, -33.868849999999995], 
                    orientation: [0, 0, 90],
                    translation: [-150, 30, 0],
                    color: [125, 125, 125, 125]
                },
                useTexture: false,
                sizeScale: 8
            }
        ];
    }

    loadModel({sceneURL, name, data:{position, orientation, translation, color, scale}, useTexture, ...args}) {
        const testScene = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb';
        const {id} = this.props;
        sceneURL = (sceneURL) ? `/models/${sceneURL}` : testScene;
        useTexture = useTexture || false;


        const opts = {
            id: `${id}-landmark-${name}`,
            data: [{position, orientation, translation, color, scale}],
            scenegraph: sceneURL,

            // Default use 'args' to override values
            sizeScale: 4000,
            getPosition: (d) => d.position,
            getOrientation: (d) => d.orientation || [0, 180, 90],
            getTranslation: (d) => d.translation || [0, 0, 0],
            getScale: (d) => d.scale || [1, 1, 1],

            // Add color handler if useTexture == false
            ...(!useTexture &&
                {
                    getColor: (d) => d.color || [0, 0, 0, 255],
                }
            ),

            // Override parameters
            ...args
          }

        return new ScenegraphLayer(opts);
    }

 
    
    renderLayers() { 
        return this.models().map((conf) => {
            return this.loadModel(conf)
        });

    }

}

LandmarksLayer.layerName = 'LandmarksLayer';