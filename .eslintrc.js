// eslint-disable-next-line no-undef
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/vue3-essential",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "parser": "@typescript-eslint/parser",
        "sourceType": "module"
    },
    "plugins": [
        "vue",
        "@typescript-eslint"
    ],
    "rules": {
        //关闭组件命名规则
        "vue/multi-word-component-names": "off",
        "@typescript-eslint/no-explicit-any": ["off"],
        "@typescript-eslint/no-unused-vars": "off",
        '@typescript-eslint/no-non-null-assertion': 'off',
        "@typescript-eslint/no-this-alias": 'off',
        "@typescript-eslint/ban-types": 'off',
        'no-undef': 'off',
        "no-debugger": "off",
    }
}
