import { slide as Menu } from 'react-burger-menu'
import React from 'react';
import "../css/UserList.css"

function UserList(props){
        const {userList, fill, stroke, isOpen}= props;

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
                onStateChange={props.onStateChange}
                isOpen={isOpen}
                customBurgerIcon={false}
                right styles={styles}
            >
                {userList}
            </Menu>
        );
    }

export default UserList;
