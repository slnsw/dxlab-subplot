import React, {Component} from 'react';
import { MapDataContext } from '../../context/MapsContext';

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
            this.closeTimer = setTimeout(() => {

                this.requestClose();
                clearTimeout(this.closeTimer);
            }, 6000);

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
        // const [mapState, dispatch] = this.context;
        // const { around } = mapState; 
        // console.log(around);
        const {title, imageUrl, isOpen, asset_id} = this.props;
        return isOpen && (
            <div 
                ref={this.setContentRef.bind(this)}
                style={{background: '#000a', position: 'absolute', zIndex: 1000, width: '100vw', height: '100vh'}}
                tabIndex="-1"
                onKeyDown={this.onKeyDown.bind(this)}
            >   
                <h4 style={{color: '#fff', textAlign:'center'}}>  <span>{asset_id}</span> {title} </h4>
                <button onClick={this.requestClose.bind(this)} style={{ padding: '20px'}}>Close</button>
                <img src={imageUrl} alt="" width="auto" height="auto" style={{maxHeight: '80vh', naxWidht: '800px', textAlign: 'center'}}/>
                 
            </div>
        );
    }
} 

ModalWindow.contextType = MapDataContext;