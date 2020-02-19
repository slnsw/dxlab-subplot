import React, { Component } from 'react';
import { MapDataContext } from '../../../context/MapsContext';

import IdleTimer from 'react-idle-timer'
import ReactModal from 'react-modal';
import Zoomable from './Zoomable';
import { getImageUrl } from '../../../share/utils';

import styles from './ModalWindow.module.scss';

export class ModalWindow extends Component {

    static defaultProps = {
        isOpen: false
    }

    state = {
        isOpen: false
    }

    constructor() {
        super();
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleCloseModal() {
        const { onRequestClose } = this.props;
        this.setState({ isOpen: false });
        if (onRequestClose) {
            onRequestClose();
        } else {
            console.error('Please implement onRequestClose');
        }
    }


    render() {
        const { title, isOpen, asset_id, info = {} } = this.props;
        const { similar = [] } = info
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
                                <li>{info.asset_id}</li>
                                <li>year:  {info.year}</li>
                                <li>location:  {info.location_name}</li>
                                <li>image:  ({info.width} x {info.height})</li>
                            </ul>

                            <div  className={styles.similar}>

                                {similar.map((value, index) => {
                                    const image = getImageUrl(value.asset_id, 'uncrop', '256');
                                    return <img src={image} alt={value.asset_id} />
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