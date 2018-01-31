import React, { Component } from 'react';
import { RelativeTime,ParsedText } from './common';
import { sendMessage,privateMessage } from './api2'
import Textarea from "react-textarea-autosize";

function ChatMessage(props){
	// console.log(message);
	const message = props.data;
	return (
		<div className={"chat-message " + (message.mine ? "mine" : "")}>
			<div className="user-name">{message.character}</div>
			<RelativeTime created_at={message.timestamp} />
			<div className="message"><ParsedText character={message.character} text={message.message} /></div>
		</div>
	)
}

class UserProfile extends Component {
	render() {
		return (
			<div className="chat-user-profile-contain">
				profile.
			</div>
		)
	}
}

class UserList extends Component {
	constructor(props) {
    	super(props);

    	this.state= {
    		sortType: this.props.defaultSort || 'Alphabetical',
            searchString: ""
    	}
	}
	performFilterSort(array,searchString,sortType,label) {
	    function alpha(a,b) {
	        if (a.identity < b.identity) return -1;
	        if (a.identity > b.identity) return 1;
	        return 0;
	    }
	  
	    function type(a,b) { 
	        // bookmarks/favorites..
	        if (!a.favorited && b.favorited) return 1;
	        if (a.favorited && !b.favorited) return -1;
	        if (!a.bookmarked && b.bookmarked) return 1;
	        if (a.bookmarked && !b.bookmarked) return -1;

	        // TODO: gender

	        // alpha 
	        if (a.identity < b.identity) return -1;
	        if (a.identity > b.identity) return 1;
	        return 0;
	    }

	    if (!Array.isArray(array)) {
	        array = Object.values(array);
	    }

	    switch(label) {
	        // type:
	        // 0 is public
	        // 1 is private
	        // 2 is private invite only
	        // 3 is private PM

	        case 'messages':
	            break;
	        case 'channels':
	            array = array.filter((obj)=> {
	                return obj.type < 2;
	            });
	            break;
	        case 'friends':
	            array = array.filter((obj)=> {
	                return obj.type == 3;
	            });
	            break;
	        default:
	            // console.log('missing label',array,label);
	            break;
	    }


	    if (searchString.length) {
	        array = array.filter((obj)=> {
	            return obj.identity.search(new RegExp(searchString, "i")) !== -1;
	        });
	    }
	    
	    // determine which function to use here.
	    switch(sortType) {
	        case 'Alphabetical':
	            return array.sort(alpha);
	        case 'Type':
	            return array.sort(type);
	        default:
	            console.log('invalid sortType',sortType);
	            return array;
	    }
	}
	handleClick(name) {
		if (!name) {
			console.log('whatd you click?',name);
			return;
		}
		this.props.usernameClicked(name);
	}
   	render() {
        const users = this.performFilterSort(this.props.users || [],this.state.searchString,this.state.sortType); //this.state.filteredRooms;
		return (
			<div className={"chat-user-list-contain " + ( this.props.userListOpen ? "" : "full" )}>
				{users && users.map((obj) => {
					// TODO: gender stuff.
					// TODO: status icons.

					return (
						<div className="list-user" key={obj.identity} onClick={() => this.handleClick(obj.identity)}>
							<div className="status-icon"></div>
							<div className="rank-icon"></div>
							<div className="user-name">{obj.identity}</div>
						</div>
					)	
				})}
			</div>
		)
	}
}

class Chat extends Component {
	constructor(props) {
    	super(props);

    	this.state= {
			chatMenuOpen: false,
			favorited: this.props.favorited, // this is going to come from cookie.
			ignored: this.props.ignored
    	}
    	this.usernameClicked = this.usernameClicked.bind(this);
	}
    toggleChatMenu() {
    	this.setState({chatMenuOpen: !this.state.chatMenuOpen});
    }
    clearSelectedChat() {
    	this.props.clearSelectedChat();

    	// TODO: tell the api we've left a channel

		// this.toggleChatMenu();
    }
    reportSelectedChat() {
    	this.props.reportSelectedChat();
    	this.toggleChatMenu();
    }
    toggleFavorite() {
    	// TODO: write into favorites list
    	this.setState({favorited: !this.state.favorited});
    	this.toggleChatMenu();
    }
    toggleIgnore() {
    	// TODO: api needs to tell server we've added this.
    	// TODO: write into ignore list.

    	this.setState({ignored: !this.state.ignored});
    	this.toggleChatMenu();
    }
    handleChange(event){
		this.setState({
			inputValue: event.target.value
		});
    }
    scrollToBottom(){
 		this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}
	handleKeyDown(event) {
		// console.log(event.key);
        if (event.key === 'Enter' && !this.shiftDown) {
        	event.preventDefault();
        	event.nativeEvent.stopPropagation();
        	event.nativeEvent.preventDefault(); 
    	  	event.nativeEvent.stopImmediatePropagation();
    	}
		if (event.key === 'Shift') {
  			this.shiftDown = true;
  		}
  	}
  	handleKeyUp(event) {
		// TODO: TPN  		
		// TODO height of input-contain to keep from needing to scroll.
  		if (event.key === 'Shift') {
  			this.shiftDown = false;
  		}
        if (event.key === 'Enter' && !this.shiftDown) {
        	event.preventDefault();
        	event.nativeEvent.stopPropagation();
        	event.nativeEvent.preventDefault(); 
    	  	event.nativeEvent.stopImmediatePropagation();

  			this.onSendMessage();
  			this.scrollToBottom();
  		}
  	}
 	onSendMessage(){
 		if (this.state.inputValue) {
 			if (this.props.chat.type === 3) {
 				privateMessage(this.props.selectedChat,this.state.inputValue.trim());
 			} else {
    			sendMessage(this.props.selectedChat,this.state.inputValue.trim());
    		}
    		this.lastInput = this.state.inputValue; // save this incase the user wants it back.
    		this.setState({inputValue:''}); // clear input here.
    	}
    }
    getLogs(value) {
    	// TODO
    }
    usernameClicked(value) {
    	console.log(value);
    	// open a pm to this user!
    	// TODO!
    }
   	render() {
   		const chat = this.props.chat;
		return (
			<div className="chat-window">
				<div className={"no-chat " + ( this.props.selectedChat ? "hidden" : "" )}>
					<span>No chat selected</span>
				</div>
				{this.props.selectedChat && (
					<div className="chat-wrap">
						<div className={"chat-contain " + (this.props.userListOpen ? "" : "full")}>
							<div className="chat-header">
								<div className="chat-header-wrap">
									<div className="chat-title">{chat.channel}</div>
									
									{(() => {
								        switch (chat.type) {
								        	case 0: return <div className="chat-subtitle"><ParsedText text={chat.description} /></div>;
								        	case 1: return <div className="chat-subtitle"><ParsedText text={chat.description} /></div>;
								        	case 2: return <div className="chat-subtitle"><ParsedText text={chat.description} /></div>;
								        	case 3: return ''; // TODO: render status and stuff.
								        	default: return '';
								        }
								    })()}
								</div>
								<div className="settings-button" onClick={() => this.toggleChatMenu()}>
									<div className="fi-widget"></div>
								</div>
							</div>

					        <div className={"dropdown " + (this.state.chatMenuOpen ? "visible" : "")}>
								<div onClick={() => this.clearSelectedChat()} className="list-item"><div className="list-icon fi-trash"></div>{chat.type === 3 ? "Close Chat" : "Leave Channel"}</div>
								<div onClick={() => this.toggleFavorite()} className={"list-item " + (this.state.favorited ? "hidden" : "")}><div className="list-icon fi-star"></div>Favorite</div>
								<div onClick={() => this.toggleFavorite()} className={"list-item " + (this.state.favorited ? "" : "hidden")}><div className="list-icon fi-star"></div>Unfavorite</div>
								{(chat.type === 3) && (<div onClick={() => this.toggleIgnore()} className={"list-item " + (this.state.ignored ? "hidden" : "")}><div className="list-icon fi-plus"></div>Ignore</div>)}
								{(chat.type === 3) && (<div onClick={() => this.toggleIgnore()} className={"list-item " + (this.state.ignored ? "" : "hidden")}><div className="list-icon fi-minus"></div>Unignore</div>)}
								<div onClick={() => this.getLogs()} className="list-item"><div className="list-icon fi-page"></div>Get logs</div>								
								<div onClick={() => this.reportSelectedChat()} className="list-item"><div className="list-icon fi-flag"></div>Report</div>
							</div>

							<div className="messages-contain">
								{chat.messages && chat.messages.map((obj) => {
									// TODO filter out ignored users

									return (
									  <ChatMessage 
									    key={obj.key}
									    data={obj} 
									  />
									)
								})}

						    	<div className={"typing-indicator " + 
						    	    (() => {
								        switch (chat.typing) {
								        	case "typing": return 'visible';
								        	case "paused": return 'paused';
								        	case "clear":  return '';
								        	default:      return '';
								        }
								    })()
						    	}>
						    		<div className="dot-one"></div>
						    		<div className="dot-two"></div>
						    		<div className="dot-three"></div>
						    	</div>
						    	<div className="input-padding" ref={(el) => { this.messagesEnd = el; }}></div>
							</div>

							<div className="input-contain">
								<div className={"label " + (this.state.inputValue ? "hidden" : "")} >
						    		<span>Type a message</span>
							    </div>
	
							    <Textarea
								  	minRows={3}
							  	  	maxRows={12}
							  	  	type="text"
							  	  	name="message"
							  	  	resizable="false"
						  	  	    useCacheForDOMMeasurements={true}
							  	  	value={this.state.inputValue}
							  	  	onKeyUp={(event) => this.handleKeyUp(event)}
							  	  	onKeyDown={(event) => this.handleKeyDown(event)}
							  	  	onChange={(event) => this.handleChange(event)}
								/>
							</div>
						</div>
						{(chat.type === 3) && (
							<div className={"chat-user-profile-contain " + ( this.props.userListOpen ? "" : "full" )}>
								<UserProfile />
							</div>
						)}
						{(chat.type !== 3) && (
							<UserList users={chat.users} userListOpen={this.props.userListOpen} usernameClicked={this.usernameClicked} />
						)}
					</div>
				)}
			</div>
		)
	}
}

export default Chat;