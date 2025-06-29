## How to compile pdfium to wasm

You will need depot_tools and emsdk

```
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:/path/to/depot_tools"
```

### Create `.gclient` file

```
solutions = [
  { "name"        : 'pdfium',
    "url"         : 'https://pdfium.googlesource.com/pdfium.git',
    "deps_file"   : 'DEPS',
    "managed"     : False,
    "custom_deps" : {
    },
    "custom_vars": {'checkout_configuration': 'minimal'},
  },
]
target_os = [ 'emscripten' ]
```

### Clone the pdfium source

I will use 6815 version here, if you use other version, you might need to patch it slightly different.

```
gclient sync -r origin/chromium/6815 --no-history --shallow
```

### Install emsdk

```
cd pdfium/third_party
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

### Patch sources (Most Difficult Part)

#### pdfium/BUILD.gn

We need to disable `skia`. Find and comment out/remove this line:

```
deps += [ "//skia" ]
```

#### pdfium/build/config/BUILDCONFIG.gn

We need to add a target os support for wasm. Find and add the `target_os` support for wasm, the `target_os` can be `emscripten` or `wasm`, it's up to you, but remember to update your code:

```
else if (target_os == "emscripten") {
  _default_toolchain = "//build/toolchain/wasm:$target_cpu"
} else {
  assert(false, "Unsupported target_os: $target_os")
}
```