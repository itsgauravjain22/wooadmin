import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import Moment from 'moment';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import GLOBAL from './customerglobal'
import SearchBar from '../commoncomponents/searchbar'

const config = require('../../../config.json');

export default class OrdersList extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Customers',
            headerRight: () => (
                <TouchableOpacity
                    style={{ paddingRight: 20 }}
                    onPress={() => { navigation.navigate("Settings") }}
                >
                    <Ionicons name='md-more' size={25} color={config.colors.headerRightColor} />
                </TouchableOpacity>
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            hasMoreToLoad: true,
            searchValue: '',
            data: [],
            page: 1,
            error: null,
            refreshing: false,
            base_url: null,
            c_key: null,
            c_secret: null,
        };
        GLOBAL.customerslistScreen = this
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.fetchCustomersList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getCredentials = async () => {
        const credentials = await SecureStore.getItemAsync('credentials');
        const credentialsJson = JSON.parse(credentials)
        this.setState({
            base_url: credentialsJson.base_url,
            c_key: credentialsJson.c_key,
            c_secret: credentialsJson.c_secret,
        })
    }

    fetchCustomersList = () => {
        const { base_url, c_key, c_secret, page, searchValue } = this.state;
        let url = `${base_url}/wp-json/wc/v3/customers?page=${page}&consumer_key=${c_key}&consumer_secret=${c_secret}&order=desc&orderby=registered_date&per_page=20`;

        if (searchValue) {
            url = url.concat(`&search=${searchValue}`)
        }
        this.setState({ loading: true });
        setTimeout(() => {
            fetch(url).then((response) => response.json())
                .then((responseJson) => {
                    if (Array.isArray(responseJson) && responseJson.length) {
                        this.setState({
                            hasMoreToLoad: true,
                            data: this.state.data.concat(responseJson),
                            error: responseJson.error || null,
                            loading: false,
                            refreshing: false
                        });
                    } else {
                        this.setState({
                            hasMoreToLoad: false,
                            error: responseJson.code || null,
                            loading: false,
                            refreshing: false
                        });
                    }
                }).catch((error) => {
                    this.setState({
                        hasMoreToLoad: false,
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
                <ActivityIndicator color={config.colors.loadingColor} size='large' />
            </View>
        )
    }

    handleRefresh = () => {
        this.setState({
            page: 1,
            refreshing: true,
            data: []
        },
            () => {
                this.fetchCustomersList();
            }
        )
    }

    handleLoadMore = () => {
        this.setState({
            page: this.state.page + 1,
        }, () => {
            this.fetchCustomersList();
        }
        )
    }

    handleSearch = (value) => {
        this._isMounted && this.setState({
            searchValue: value,
            page: 1,
            refreshing: true,
            data: []
        }, () => {
            this.fetchCustomersList()
        })
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.navigate('CustomerDetails', {
                    customerId: item.id,
                });
            }}>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        {item.avatar_url
                            ? <Image
                                source={{ uri: item.avatar_url }}
                                style={{ height: 80, width: 80 }}
                                resizeMode='contain'
                            />
                            : <Ionicons name='md-person' size={80} color='gray' />
                        }
                    </View>
                    <View style={{ flex: 3, marginTop: 10, marginBottom: 10, justifyContent: "center" }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.titleText}>{item.username}</Text>
                            <Text>Name: {item.first_name} {item.last_name}</Text>
                            <Text>Email: {item.email}</Text>
                            <Text>Is Paying: {item.is_paying_customer?'Yes':'No'}</Text>
                            <Text>Created: {Moment(item.date_created).format('dddd, Do MMM YYYY h:m:s a')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <SearchBar onSearchPress={this.handleSearch}></SearchBar>
                <FlatList
                    data={this.state.data}
                    keyExtractor={item => item.id.toString()}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    onEndReached={this.state.hasMoreToLoad ? this.handleLoadMore : null}
                    onEndReachedThreshold={0.5}
                    ItemSeparatorComponent={this.renderListSeparator}
                    ListFooterComponent={this.renderListFooter}
                    renderItem={this.renderItem}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});
