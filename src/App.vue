<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-item link v-for="(menu, i) in menus" :key="i" :to="menu.link">
            <v-list-item-icon>
              <v-icon v-text="menu.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="menu.text"></v-list-item-title>
            </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Найти"
        single-line
        hide-details
      ></v-text-field>
    </v-app-bar>
    <v-main>
      <router-view :search="search"></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false,
      search: '',
      menus: [{text: 'Исходящие', icon: 'mdi-email-receive', link: '/',},{text: 'Входящие', icon: 'mdi-email-send', link: '/entry'},{text: 'Договора', icon: 'mdi-mail', link: '/contract'}],
    }
  },
}

</script>

<style scoped>

</style>