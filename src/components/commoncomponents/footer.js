import React, { Component } from 'react';
import { Text, StyleSheet } from 'react-native';
import {Footer, FooterTab, Icon, Button} from 'native-base';

export default class AppFooter extends Component {
    constructor(props){
        super(props);
        this.state = { activeTab: 1 };
    }
    render() {
        return (
            <Footer>
                <FooterTab style={{backgroundColor:"#fff"}}>
                    <Button vertical onPress={() => this.props.navigation.navigate('Home')}>
                        <Icon name="card" style={(this.state.activeTab === 1)?styles.active:styles.inactive}/>
                        <Text style={(this.state.activeTab === 1)?styles.active:styles.inactive}>Products</Text>
                    </Button>
                    <Button vertical>
                        <Icon name='paper' style={(this.state.activeTab === 2)?styles.active:styles.inactive} />
                        <Text style={(this.state.activeTab === 2)?styles.active:styles.inactive}>Orders</Text>
                    </Button>
                    <Button vertical>
                        <Icon name='settings' style={(this.state.activeTab === 3)?styles.active:styles.inactive} />
                        <Text style={(this.state.activeTab === 3)?styles.active:styles.inactive}>Settings</Text>
                    </Button>
                </FooterTab>
            </Footer>
        );
    }
}

const styles = StyleSheet.create({
    inactive: {
        color: '#666'
    },
    active: {
        color: '#96588a'
    }
});
