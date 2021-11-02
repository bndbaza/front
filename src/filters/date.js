export default function dateFilter(value, format= 'date') {
    const options ={}
    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(value))
}