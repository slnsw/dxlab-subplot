import React, { Component } from 'react';
import { MapDataContext } from '../../../context/MapsContext';

import IdleTimer from 'react-idle-timer'
import ReactModal from 'react-modal';
import Zoomable from './Zoomable';
import { getImageUrl } from '../../../share/utils';
import { selectMap, unSelectMap } from '../../../context/MapsActions';

import { get, find } from 'lodash'


import styles from './ModalWindow.module.scss';

export class ModalWindow extends Component {

    static defaultProps = {
        isOpen: false
    }

    state = {
        isOpen: false,
    }

    constructor() {
        super();
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleCloseModal() {
        const [, distpatch] = this.context
        const { onRequestClose } = this.props;
        this.setState({ isOpen: false });
        if (onRequestClose) {
            distpatch(unSelectMap())
            onRequestClose();
        } else {
            console.error('Please implement onRequestClose');
        }
    }

    onRelateClick(asset_id) {
        const [state, distpatch] = this.context
        const data = get(state, 'maps.data', [])
        const select = find(data, ['properties.asset_id', asset_id])
        if (select) {
            distpatch(selectMap(select))
        }
        // console.log(select)
    }


    render() {

        const { isOpen } = this.props

        if (!isOpen) 
            return null

        const [state,] = this.context
        let selected = get(state, 'maps.selected')
        selected = (!selected) ? {} : selected

        const { properties = {} } = selected
        const { similar = [], asset_id, title, year, width, height, location_name } = properties

        const related = similar.filter((rel) => {
            let show = rel.asset_id !== asset_id
            if (rel.distance) {
                show = show && rel.distance <= 5
            }

            return show
        })

        return (
            <React.Fragment>
                <IdleTimer
                    ref={ref => { this.idleTimer = ref }}
                    element={document}
                    onIdle={this.handleCloseModal}
                    debounce={250}
                    timeout={1000 * 60 * .5} />

                <ReactModal
                    isOpen={isOpen}
                    onRequestClose={this.handleCloseModal}
                    ariaHideApp={false}
                    className={styles.modalWindow}
                    overlayClassName={styles.modalOverlay}
                >
                    <React.Fragment>
                        <button className={styles.close} onClick={this.handleCloseModal}>X</button>

                        <div className={styles.zoomable}>
                            <Zoomable assetId={asset_id} />
                        </div>

                        <div className={styles.info}>
                            <h1 className={styles.modalTitle}> {title} </h1>
                            <ul className={styles.details}>
                                <li>{asset_id}</li>
                                <li>year:  {year}</li>
                                <li>location:  {location_name}</li>
                                <li>image:  ({width} x {height})</li>
                            </ul>

                            <div className={styles.related}>

                                {related.map((value, index) => {
                                    const image = getImageUrl(value.asset_id, 'uncrop', '256');
                                    return <img key={`rel${index}`} src={image} alt={value.distance} onClick={() => this.onRelateClick(value.asset_id)} />
                                })}

                            </div>
                        </div>
                    </React.Fragment>
                </ReactModal>
            </React.Fragment>
        )
    }
}

ModalWindow.contextType = MapDataContext;