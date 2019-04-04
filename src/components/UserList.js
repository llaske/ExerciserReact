import { slide as Menu } from 'react-burger-menu'
import React, {Component} from 'react';
import "../css/UserList.css"


class UserList extends Component {

    handleStateChange=(state)=>{
        this.props.onStateChange(state)
    };


    render () {
        const {userList, stroke, isOpen}= this.props;

        let styles = {
            bmCrossButton: {
                height: '30px',
                width: '30px'
            },
            bmCross: {
                background: stroke
            },
            bmMenu: {
                background: '#808080',
            }
        };

        return (
            <Menu
                onStateChange={(state) => this.handleStateChange(state)}
                isOpen={isOpen}
                customBurgerIcon={false}
                right styles={styles}
            >
                {userList}
            </Menu>
        );
    }
}

export default UserList;