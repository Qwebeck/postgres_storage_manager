
/**
 * Return data used by application in dict format
 */
function getDataDicts() {
    return {
        existing_businesses: {
            is_actual: false,
            url_creation_handler: () => '/info_about_businesses',
            data_processor: (data) => data.map(x => x['name']),
            data: {},
            related_list: datalists.available_businesses_dl,
            emit: 'bussines_update'
        },
        types_on_storage: {
            is_actual: false,
            url_creation_handler: (storage_id) => '/get_types/id/' + (storage_id || main_storage_id),
            data: {}
        },
        current_storage_statistics: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnStorage('/get_statistics/id/'),
            related_list: datalists.available_types_dl,
            emit: 'statistics_update',
            data: {}
        },
        orders_with_current_storage: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnStorage('/get_orders/'),
            emit: 'pending_orders_update',
            data: {}
        },
        // current_order_sides: {
        //     is_actual: false,
        //     url_creation_handler: () => createUrlDependingOnOrder('/sides_in_order/id/'),
        //     data: {}
        // },
        current_actual_order_description: {
            is_actual: false,
            emit: 'actual_order_selected',
            data: {},
            url_creation_handler: () => createUrlDependingOnOrder('/expand_order/id/'),
            data_processor: (data) => {
                if (!data) return null
                let available_products = convertToObject('serial_number', data.available_products)
                let order_stats = convertToObject("Тип", data.order_stats)
                return {
                    available_products: available_products,
                    order_sides: [data.order_sides],
                    order_types: data.order_stats.reduce((accumulator, el) => {
                        accumulator[el['Тип']] = el['Требуеться']
                        return accumulator
                    }, {}),
                    order_stats: Object.values(order_stats),
                    unbinded_products: new Set()
                }
            },
            pack: () => {
                return {
                    available_products: data_dicts.current_order_description.data.available_products,
                    order_stats: data_dicts.current_order_description.data.order_stats,
                    order_types: data_dicts.current_order_description.data.order_types,
                    unbinded_products: Array.from(data_dicts.current_order_description.data.unbinded_products)
                }
            }
        },
        current_history_order_description: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnOrder('/expand_history_order/id/'),
            data: {}
        }
    }
}
