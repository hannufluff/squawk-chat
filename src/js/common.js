import React, { Component } from 'react';
import parser, { Tag } from 'bbcode-to-react';
import { joinChannel } from './api2';
import loadURLS from './apiurls';
const apiurls = loadURLS();

class Avatar extends Component {
	render() {
		let iconurl = '';
		
		switch(this.props.type) {
			case 0:
				iconurl = ''; // Default public image
				break;
			case 1:
				iconurl = ''; // Default private image
				break;
			case 2:
				iconurl = ''; // Default private invite only image
				break;
			case 3:
				if (this.props.name) {
					iconurl = apiurls.avatarurl+encodeURI(this.props.name).toLowerCase()+'.png'; // private pm image				break;
				}
				break;
			default:
				// console.trace('invalid type',this.props);
				break;
		}
	
		const avatarStyle = {
			background: 'url(' + iconurl + ') no-repeat 50% 50% / cover',
		};
		return (
			<div className="avatar-contain" style={avatarStyle}></div>
		)
	}
}

class RelativeTime extends Component {
	constructor(props) {
		super(props)
		this.state = {
			relativeTime: this.relativeTime()
		}
	}
	createInterval(time) {
		// console.log('create',time);
		this.interval = setInterval(()=>{
			// console.log('tick',time);
    		this.setState({
    			relativeTime: this.relativeTime()
    		});
    	}, time);
	}
	componentDidMount() {
    	this.createInterval(1000);
  	}
  	componentWillUnmount() {
    	clearInterval(this.interval);
  	}
	relativeTime() {
		let time = this.props.created_at;
	 	if (!time) return;

	    // let day,month,year;
	    let date = new Date(time),
	        diff = ((new Date().getTime() - date.getTime()) / 1000 ),
	        day_diff = Math.floor(diff / 86400);
	    
	    if (isNaN(day_diff) || diff <= 0) {
	        return "now";
	    }

	    if (diff > 62 && diff < 80 ) {
	    	clearInterval(this.interval);
        	this.createInterval(60000);
        } else if (diff > 3600 && diff < 3680 ) {
	    	clearInterval(this.interval);
        	this.createInterval(3600000);
		}
        
	    return (
	        diff > 0 &&
	        (
	        	// eslint-disable-next-line
	            day_diff === 0 &&
	            (
	                (
	                    (diff < 60 && Math.ceil(diff) + "s") ||
	                    (diff < 3600 && Math.ceil(diff / 60)  + "m") ||
	                    (diff < 7200 && "1h") ||
	                    (diff < 86400 && Math.floor(diff / 3600) + "h")
	                )
	            // eslint-disable-next-line
	            ) ||
	            (day_diff === 1 && "1d") ||
	            (Math.ceil(day_diff) + "d")
	        )
	    );
	}
   	render() {
		return (
			<span className="timestamp">{this.state.relativeTime}</span>
		)
   	}
}

class StandardInput extends Component {
	constructor(props) {
    	super(props);
    	this.state = {
    		inputValue: this.props.initialValue || '',
    	};
    }
	handleChange(event) {
		this.setState({
			inputValue: event.target.value,
		});
		if (this.props.onChange) {
			this.props.onChange(this.props.inputName,event.target.value);
		}
  	}
  	handleKeyDown(event) {
  		if (this.props.onKeyDown) {
  			this.props.onKeyDown(event);
  		}
  	}
	render() {
		return (
			<div className="input-form-contain">
				<div className="label">
					{this.props.iconClass && (<div className={"icon "+this.props.iconClass}></div>)}
					<span className={"input-label " + (this.state.inputValue ? "" : "full" )}>{this.props.inputName}</span>
				</div>
				<input type={this.props.type || "text"} value={this.state.inputValue} onChange={(event) => this.handleChange(event)} onKeyDown={(event) => this.handleKeyDown(event)} />
			</div>
		);
	}
}

class noparseTag extends Tag {
  	toReact() {
  		// console.log(this.getContent(true));
    	return (<p>{this.getContent(true)}</p>);
  	}
}
class urlTag extends Tag {
  	toReact() {
  		const url = this.params.url || this.getContent(true);
  		const body = this.getContent(true) || this.params.url;
    	return (<a target="_blank" href={url}>{body}</a>);
  	}
}
class supTag extends Tag {
  	toReact() {
    	return (<sup>{this.getComponents()}</sup>);
  	}
}
class subTag extends Tag {
  	toReact() {
    	return (<sub>{this.getComponents()}</sub>);
  	}
}
class meTag extends Tag {
	toReact() {
    	return (<span className="action">{this.getContent(true)}</span>);
  	}
}
class iconTag extends Tag {
	toReact() {
    	return (
    		<a target="_blank" href={ apiurls.characterurl + this.getContent(true)}>
	    		<img className="icon" src={ apiurls.avatarurl + this.getContent(true) + '.png'} alt={this.getContent(true)} />
	    	</a>
	    );
  	}
}
class eiconTag extends Tag {
	toReact() {
    	return (<img className="ecion" src={ apiurls.eiconurl + this.getContent(true) + '.gif'} alt={this.getContent(true)} />);
  	}
}
class userTag extends Tag {
	toReact() {
		return (<a target="_blank" href={ apiurls.characterurl + this.getContent(true)}>{this.getContent(true)}</a>);
  	}
}
class sessionTag extends Tag {
	toReact() {
		return (
			<span className="session" onClick={() => joinChannel(this.getContent(true))}><span className="session-icon fi-lock"></span>{this.params.session}</span>
		);
  	}
}

parser.registerTag('noparse', noparseTag);
parser.registerTag('url', urlTag);
parser.registerTag('sup', supTag);
parser.registerTag('sub', subTag);
parser.registerTag('averyunlikelytag',meTag);
parser.registerTag('icon',iconTag);
parser.registerTag('eicon',eiconTag);
parser.registerTag('user',userTag);
parser.registerTag('session',sessionTag);

class ParsedText extends Component {
	render() {
		let text = this.props.text || '';

		if (text.startsWith('/me')) { // this runs on the chat.js parsing.
			text = text.replace("/me", ( '[averyunlikelytag]'+(this.props.character || '')+'[/averyunlikelytag]' )); // handle /me in here.
		}

		return (
		    <span>{parser.toReact(text)}</span>
		)
	}
}

export  { Avatar,RelativeTime,StandardInput,ParsedText };