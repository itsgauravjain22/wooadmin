import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import Moment from 'moment';
import * as SecureStore from 'expo-secure-store';
import currencySymbols from '../../utility/currencysymbol';

export default class OrdersList extends Component {

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
            refreshing: false,
            base_url: null,
            c_key: null,
            c_secret: null,
        };
    }

    async componentDidMount() {
        await this.getCredentials();
        this.fetchOrderList();
    }

    getCredentials = async() => {
        const credentials = await SecureStore.getItemAsync('credentials');
        const credentialsJson = JSON.parse(credentials)
        this.setState({
            base_url: credentialsJson.base_url,
            c_key: credentialsJson.c_key,
            c_secret: credentialsJson.c_secret,
        })
    }

    fetchOrderList = () => {
        const { base_url, c_key, c_secret, page } = this.state;
        const url = `${base_url}/wp-json/wc/v3/orders?per_page=20&page=${page}&consumer_key=${c_key}&consumer_secret=${c_secret}`
        this.setState({ loading: true });
        setTimeout(() => {
            fetch(url).then((response) => response.json())
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
                keyExtractor={item => item.id.toString()}
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
                onEndReached={this.handleLoadMore}
                onEndReachedThreshold={100}
                ItemSeparatorComponent={this.renderListSeparator}
                ListFooterComponent={this.renderListFooter}
                renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate('OrderDetails', {
                            orderId: item.id,
                            orderData: item,
                            base_url: this.state.base_url,
                            c_key: this.state.c_key,
                            c_secret: this.state.c_secret
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
