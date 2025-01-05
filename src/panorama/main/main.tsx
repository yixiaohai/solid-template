import { createEffect, createSignal, Match, onMount, Switch } from 'solid-js';
import { render } from 'solid-panorama-runtime';
import xml from 'solid-panorama-all-in-jsx/xml.macro';
import css from 'solid-panorama-all-in-jsx/css.macro';
import default_ui_config from '../config/default_ui_config';

default_ui_config();

xml(
    <root>
        <styles>
            <include src="file://{resources}/styles/custom_game/main.css" />
        </styles>
        <scripts>
            <include src="file://{resources}/scripts/custom_game/panorama-polyfill.js" />
            <include src="file://{resources}/scripts/custom_game/main.js" />
        </scripts>
        <Panel class="root" hittest={false}>
            <Panel id="app" class="root" />
        </Panel>
    </root>
);

css`
    .root {
        width: 100%;
        height: 100%;
    }
`;

const rootStyle = css`
    flow-children: down;
    horizontal-align: center;
    vertical-align: bottom;
`;

console.log('Main load');

import { Shop } from '../view/shop';
import { Lowhud } from '../view/lowhud';

export function Main() {
    const [count, setCount] = createSignal(0);

    createEffect(() => {
        console.log(`当前计数: ${count()}`);
    });

    onMount(() => {
        console.log('Created Main3', rootStyle);
    });

    return (
        <Panel class={rootStyle}>
            <Button onactivate={() => setCount(count() + 1)}>
                <Label text={`增加:${count()}`} />
            </Button>
            <Switch>
                <Match when={count() === 1}>
                    <Shop />
                </Match>
                <Match when={count() === 2}>
                    <Lowhud />
                </Match>
            </Switch>
        </Panel>
    );
}

render(() => <Main />, $('#app'));
