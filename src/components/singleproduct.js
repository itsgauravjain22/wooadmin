import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ScrollView, ActivityIndicator } from 'react-native';

export default class SingleProduct extends Component {
    constructor(props) {
        super(props);
        this.state = { loading: false };
        productData = this.props.navigation.getParam('productData');
    }

    /*
    async componentDidMount() {
        return fetch('https://www.kalashcards.com/wp-json/wc/v3/products/' + this.props.navigation.getParam('productId', 1), {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Base64.btoa('ck_20d0fd1bf4b32534250b69076ca57ac75cf51662:cs_76e01499543ded3f5ecd82d9e762d4fa1680c862'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    loading: false,
                    data: responseJson,
                }, function () {

                });

            }).catch((error) => {
                console.error(error);
            });
    }
    */

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('productName', 'Product'),
            headerStyle: {
                backgroundColor: '#96588a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        };
    };

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color='#96588a' size='large' />
                </View>
            )
        }

        return (
            <ScrollView style={{ flex: 1 }}>
                <View style={{ height: 150 }}>
                    <FlatList
                        horizontal={true}
                        data={productData.images}
                        renderItem={({ item }) =>
                            <Image source={(item) ?
                                { uri: item.src } :
                                require('../../assets/images/blank_product.png')}
                                onError={(e) => { this.props.source = require('../../assets/images/blank_product.png') }}
                                style={{ width: 150, height: 150 }} resizeMode='contain' />
                        }
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>{productData.name}</Text>
                    <Text>Sku: {productData.sku}</Text>
                    <Text>Slug: {productData.slug}</Text>
                    <Text>Total Ordered: {productData.total_sales}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Pricing</Text>
                    <Text>Regular Price: {productData.regular_price}</Text>
                    <Text>Sale Price: {productData.sale_price}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Inventory</Text>
                    <Text>Stock Status: {productData.stock_status}</Text>
                    <Text>Manage Stock: {productData.manage_stock ? 'true' : 'false'}</Text>
                    <Text>Stock Qty: {productData.stock_quantity}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Shipping</Text>
                    <Text>Weight: {productData.weight}</Text>
                    <Text>Size: {productData.dimensions.length}x{productData.dimensions.width}x{productData.dimensions.height}</Text>
                    <Text>Stock Qty: {productData.stock_quantity}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Categories</Text>
                    <FlatList
                        horizontal={true}
                        data={productData.categories}
                        renderItem={({ item }) =>
                            <View style={{ flexDirection: "row", margin: 10, backgroundColor: 'white' }}>
                                <Text>{item.name ? item.name : null}</Text>
                            </View>
                        }
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Attributes</Text>
                    <FlatList
                        data={productData.attributes}
                        renderItem={({ item }) =>
                            <View style={{ flexDirection: "row", backgroundColor: 'white' }}>
                                <Text>{item.name ? item.name : null}:</Text>

                            </View>
                        }
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    section: {
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});