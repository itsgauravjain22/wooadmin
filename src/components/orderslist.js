import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import Moment from 'moment';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Base64 from '../utility/base64';
import currencySymbols from '../utility/currencysymbol';
import SingleOrder from './singleorder';

export class OrdersList extends Component {

    static navigationOptions = {
        headerTitle: 'Orders',
        headerStyle: {
            backgroundColor: '#96588a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            page: 1,
            seed: 1,
            error: null,
            refreshing: false
        };
    }

    componentDidMount() {
        this.fetchOrderList();
    }

    fetchOrderList = () => {
        const { page } = this.state;
        const url = `https://www.kalashcards.com//wp-json/wc/v3/orders?per_page=20&page=${page}`;
        this.setState({ loading: true });
        setTimeout(() => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + Base64.btoa('ck_20d0fd1bf4b32534250b69076ca57ac75cf51662:cs_76e01499543ded3f5ecd82d9e762d4fa1680c862'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        data: [...this.state.data, ...responseJson],
                        error: responseJson.error || null,
                        loading: false,
                        refreshing: false
                    });
                }).catch((error) => {
                    this.setState({
                        error,
                        loading: false,
                        refreshing: false
                    })
                });
        }, 1500);
    };

    renderListSeparator = () => {
        return (
            <View style={{
                height: 1,
                width: '100%',
                backgroundColor: '#999999'
            }} />
        )
    }

    renderListFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View style={{
                paddingVertical: 20,
            }}>
                <ActivityIndicator color='#96588a' size='large' />
            </View>
        )
    }

    handleRefresh = () => {
        this.setState(
            {
                page: 1,
                refreshing: true,
                seed: this.state.seed + 1
            },
            () => {
                this.fetchOrderList();
            }
        )
    }

    handleLoadMore = () => {
        this.setState(
            {
                page: this.state.page + 1,
            },
            () => {
                this.fetchOrderList();
            }
        )
    }

    render() {
        return (
            <FlatList
                data={this.state.data}
                keyExtractor={item => item.id}
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
                onEndReached={this.handleLoadMore}
                onEndReachedThreshold={100}
                ItemSeparatorComponent={this.renderListSeparator}
                ListFooterComponent={this.renderListFooter}
                renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate('SingleOrder', {
                            orderId: item.id,
                            orderData: item
                        });
                    }}>
                        <View
                            style={{
                                flex: 1,
                                paddingTop: 10,
                                paddingBottom: 10,
                                backgroundColor: 'white',
                                justifyContent: 'center',
                            }}>
                            <View style={{ marginLeft: 10 }}>
                                <Text>{Moment(item.date_created).format('dddd, Do MMM YYYY h:m:s')}</Text>
                                <Text style={styles.titleText}>#{item.number} {item.billing.first_name} {item.billing.last_name}</Text>
                                <Text>Status: {item.status}</Text>
                                <Text>Total: {(currencySymbols[item.currency]) ? currencySymbols[item.currency] : item.currency}{item.total}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                }
            />
        );
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});

const AppNavigator = createStackNavigator({
    Orders: OrdersList,
    SingleOrder: SingleOrder
},{
    initialRouteName: 'Orders',
}
);

export default createAppContainer(AppNavigator);