import React, { Component } from 'react';
import { MapDataContext } from '../../../context/MapsContext';

import IdleTimer from 'react-idle-timer'
import ReactModal from 'react-modal';
import Zoomable from './Zoomable';

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
        const { title, isOpen, asset_id } = this.props;
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
                    <h4 className={styles.modalTitle}>  <span>{asset_id}</span> {title} </h4>
                    <button onClick={this.handleCloseModal} style={{ padding: '20px' }}>Close</button>
                    <div className={styles.zoomable}>
                        <Zoomable assetId={asset_id} />
                    </div>
                </ReactModal>
            </React.Fragment>
        )
    }
}

ModalWindow.contextType = MapDataContext;