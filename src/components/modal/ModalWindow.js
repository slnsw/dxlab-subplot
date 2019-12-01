import React, {Component} from 'react';
import { MapDataContext } from '../../context/MapsContext';
import Zoomable from './Zoomable';

import styles from './ModalWindow.module.scss';

export class ModalWindow extends Component {

    static defaultProps = {
        isOpen : false
    }

    state = {
        isOpen : false
    }

    requestClose() {
        const {onRequestClose} = this.props;
        this.setState({ isOpen: false });
        if (onRequestClose) {
            onRequestClose();
        } else {
            console.error('Please implement onRequestClose');
        }
    }

    componentDidUpdate({isOpen}){
        const { isOpen : stateOpen } = this.state;
        // Prevent the creation of multiple timeouts

        if ( isOpen && !stateOpen ) {
            this.setState({ isOpen });
            // this.closeTimer = setTimeout(() => {

            //     this.requestClose();
            //     clearTimeout(this.closeTimer);
            // }, 6000);

        }
    }

    componentWillMount() {
        clearTimeout(this.closeTimer);
    }
 
    onKeyDown(evt) {
        let isEscape = false;
        evt = evt || window.event;
        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
        } else {
            isEscape = (evt.keyCode === 27);
        }
        if (isEscape) {
            this.requestClose();
        }
    }

    setContentRef(content) {
        // Set focus to this content
        if(content) {
            content.focus();
        }
    }

    render () {
        const {title, isOpen, asset_id} = this.props;
        return isOpen && (
            <div className={styles.modalWindow}
                ref={this.setContentRef.bind(this)}
                tabIndex="-1"
                onKeyDown={this.onKeyDown.bind(this)}
            >   
                <h4 className={styles.modalTitle}>  <span>{asset_id}</span> {title} </h4>
                <button onClick={this.requestClose.bind(this)} style={{ padding: '20px'}}>Close</button>
                <div className={styles.zoomable}>  
                    <Zoomable assetId={asset_id}/> 
                </div>
            </div>
        );
    }
} 

ModalWindow.contextType = MapDataContext;