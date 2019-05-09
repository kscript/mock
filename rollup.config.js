import typescript from "rollup-plugin-typescript";
export default {
    input: 'src/index.js',
    output: {
        file: 'bundle.js',
        format: 'cjs'
    },
    plugins: [
        typescript({
            "target": "es5",
            "sourceMap": false
        })
    ]
};
